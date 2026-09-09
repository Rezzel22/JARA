<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        $projects = Project::query()
            ->select(['id', 'name'])
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
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $project = Project::query()->create($validated);

        return response()->json([
            'id' => $project->id,
            'name' => $project->name,
        ], Response::HTTP_CREATED);
    }

    public function progress(int $id): JsonResponse
    {
        Project::query()->findOrFail($id);

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

    public function addMember(Request $request, int $id): JsonResponse
    {
        $project = Project::query()->findOrFail($id);
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $project->members()->syncWithoutDetaching([$validated['user_id']]);
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

    public function assignTask(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $assignees = DB::transaction(function () use ($id, $validated) {
            $task = DB::table('tasks')
                ->select(['id', 'project_id'])
                ->find($id);

            if ($task === null) {
                abort(Response::HTTP_NOT_FOUND);
            }

            if ($task->project_id === null) {
                throw ValidationException::withMessages([
                    'task' => 'Task must belong to a project before it can be assigned.',
                ]);
            }

            $project = Project::query()->findOrFail($task->project_id);

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
