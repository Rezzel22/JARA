<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Policies\ProjectPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class ProjectController extends Controller
{
    protected ProjectPolicy $policy;

    public function __construct()
    {
        $this->policy = new ProjectPolicy;
    }

    protected function resolveCurrentUser(Request $request): ?User
    {
        if ($user = Auth::user()) {
            return $user;
        }

        if ($request->user()) {
            return $request->user();
        }

        if ($headerUserId = $request->header('X-User-Id')) {
            return User::query()->find($headerUserId);
        }

        if ($paramUserId = $request->input('current_user_id')) {
            return User::query()->find($paramUserId);
        }

        return null;
    }

    public function index(): JsonResponse
    {
        $projects = Project::query()
            ->select(['id', 'name', 'owner_id'])
            ->with(['members' => fn ($query) => $query
                ->select(['users.id', 'name', 'email'])
                ->orderBy('name')
                ->orderBy('users.id')])
            ->orderBy('name')
            ->orderBy('id')
            ->get();

        return response()->json($projects);
    }

    public function store(Request $request): JsonResponse
    {
        $currentUser = $this->resolveCurrentUser($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $project = DB::transaction(function () use ($validated, $currentUser) {
            $project = Project::query()->create([
                'name' => $validated['name'],
                'owner_id' => $currentUser?->id,
            ]);

            if ($currentUser !== null) {
                $project->members()->syncWithoutDetaching([
                    $currentUser->id => ['role' => 'owner'],
                ]);
            }

            return $project;
        });

        return response()->json([
            'id' => $project->id,
            'name' => $project->name,
            'owner_id' => $project->owner_id,
        ], Response::HTTP_CREATED);
    }

    public function progress(Request $request, string|int $id): JsonResponse
    {
        if (! is_numeric($id)) {
            return response()->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $id = (int) $id;
        $project = Project::query()->find($id);

        if ($project === null) {
            return response()->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $currentUser = $this->resolveCurrentUser($request);

        if (! $this->policy->viewProgress($currentUser, $project)) {
            return response()->json([
                'message' => 'Unauthorized. You do not have permission to view this project progress.',
            ], Response::HTTP_FORBIDDEN);
        }

        $tasks = DB::table('tasks')->where('project_id', $id);
        $totalTasks = $tasks->count();
        $completedTasks = (clone $tasks)->where('is_done', true)->count();

        return response()->json([
            'project_id' => $id,
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'progress' => $totalTasks === 0
                ? 0
                : round(($completedTasks / $totalTasks) * 100, 2),
        ]);
    }

    public function addMember(Request $request, string|int $id): JsonResponse
    {
        if (! is_numeric($id)) {
            return response()->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $id = (int) $id;
        $project = Project::query()->find($id);

        if ($project === null) {
            return response()->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $currentUser = $this->resolveCurrentUser($request);

        if (! $this->policy->addMember($currentUser, $project)) {
            return response()->json([
                'message' => 'Unauthorized. Only project owners can add members.',
            ], Response::HTTP_FORBIDDEN);
        }

        $newMemberId = (int) $validated['user_id'];

        if ($project->owner_id === null) {
            $project->owner_id = $newMemberId;
            $project->save();
        }

        $role = ($project->owner_id === $newMemberId) ? 'owner' : 'member';
        $project->members()->syncWithoutDetaching([$newMemberId => ['role' => $role]]);

        $project->load(['members' => fn ($query) => $query
            ->select(['users.id', 'name', 'email'])
            ->orderBy('name')
            ->orderBy('users.id')]);

        return response()->json([
            'id' => $project->id,
            'name' => $project->name,
            'members' => $project->members,
        ]);
    }

    public function removeMember(Request $request, string|int $id, string|int|null $userId = null): JsonResponse
    {
        if (! is_numeric($id)) {
            return response()->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $id = (int) $id;
        $project = Project::query()->find($id);

        if ($project === null) {
            return response()->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $targetUserId = $userId ?? $request->input('user_id');

        $request->merge(['target_user_id' => $targetUserId]);
        $validated = $request->validate([
            'target_user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $targetUser = User::query()->find($validated['target_user_id']);
        $currentUser = $this->resolveCurrentUser($request);

        if (! $this->policy->removeMember($currentUser, $project, $targetUser)) {
            return response()->json([
                'message' => 'Unauthorized. Only project owners can remove members.',
            ], Response::HTTP_FORBIDDEN);
        }

        DB::transaction(function () use ($project, $targetUser) {
            $project->members()->detach($targetUser->id);

            // Remove task assignments for this member within this project
            DB::table('task_user')
                ->where('user_id', $targetUser->id)
                ->whereIn('task_id', DB::table('tasks')->select('id')->where('project_id', $project->id))
                ->delete();
        });

        return response()->json(['message' => 'Member removed successfully.'], Response::HTTP_OK);
    }

    public function assignTask(Request $request, string|int $id): JsonResponse
    {
        if (! is_numeric($id)) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $id = (int) $id;

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $currentUser = $this->resolveCurrentUser($request);

        $assignees = DB::transaction(function () use ($id, $validated, $currentUser) {
            $task = DB::table('tasks')
                ->select(['id', 'project_id'])
                ->where('id', $id)
                ->first();

            if ($task === null) {
                abort(Response::HTTP_NOT_FOUND);
            }

            if ($task->project_id === null) {
                throw ValidationException::withMessages([
                    'task' => 'Task must belong to a project before it can be assigned.',
                ]);
            }

            $project = Project::query()->findOrFail($task->project_id);

            if ($currentUser !== null && ! $project->isMember($currentUser) && $project->owner_id !== null) {
                abort(Response::HTTP_FORBIDDEN, 'Unauthorized.');
            }

            if (! $project->members()->whereKey($validated['user_id'])->exists()) {
                throw ValidationException::withMessages([
                    'user_id' => 'The selected user must be a member of the task project.',
                ]);
            }

            DB::table('task_user')->insertOrIgnore([
                'task_id' => $id,
                'user_id' => $validated['user_id'],
            ]);

            return User::query()
                ->select(['id', 'name', 'email'])
                ->whereIn('id', DB::table('task_user')
                    ->select('user_id')
                    ->where('task_id', $id))
                ->orderBy('name')
                ->orderBy('id')
                ->get();
        });

        return response()->json([
            'task_id' => $id,
            'assignees' => $assignees,
        ]);
    }
}
