<?php

use App\Http\Controllers\ProjectController;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

Route::get('/api/projects', [ProjectController::class, 'index']);
Route::post('/api/projects', [ProjectController::class, 'store']);
Route::post('/api/projects/{id}/members', [ProjectController::class, 'addMember']);
Route::post('/api/tasks/{id}/assignees', [ProjectController::class, 'assignTask']);

beforeEach(function () {
    if (! Schema::hasTable('tasks')) {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable();
            $table->string('title');
            $table->string('priority');
            $table->date('deadline');
            $table->boolean('is_done')->default(false);
            $table->timestamps();
        });
    }
});

it('creates a project from valid input', function () {
    $response = $this->postJson('/api/projects', [
        'name' => 'Project PPK',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('name', 'Project PPK');
    $this->assertDatabaseHas('projects', ['name' => 'Project PPK']);
});

it('returns 422 when the project name is missing', function () {
    $response = $this->postJson('/api/projects', []);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
    $this->assertDatabaseCount('projects', 0);
});

it('lists projects with their members in a stable order', function () {
    Project::factory()->create(['name' => 'Zulu Project']);
    $project = Project::factory()->create(['name' => 'Alpha Project']);
    $member = User::factory()->create([
        'name' => 'Alya',
        'email' => 'alya@example.com',
    ]);
    $project->members()->attach($member);

    $response = $this->getJson('/api/projects');

    $response
        ->assertOk()
        ->assertJsonCount(2)
        ->assertJsonPath('0.name', 'Alpha Project')
        ->assertJsonPath('0.members.0.email', 'alya@example.com')
        ->assertJsonPath('1.name', 'Zulu Project');
});

it('adds multiple users to a project without duplicates', function () {
    $project = Project::factory()->create();
    $firstUser = User::factory()->create();
    $secondUser = User::factory()->create();

    $firstResponse = $this->postJson("/api/projects/{$project->id}/members", [
        'user_id' => $firstUser->id,
    ]);
    $secondResponse = $this->postJson("/api/projects/{$project->id}/members", [
        'user_id' => $secondUser->id,
    ]);
    $duplicateResponse = $this->postJson("/api/projects/{$project->id}/members", [
        'user_id' => $firstUser->id,
    ]);

    $firstResponse
        ->assertOk()
        ->assertJsonPath('members.0.id', $firstUser->id);
    $secondResponse->assertOk();
    $duplicateResponse->assertOk();
    $this->assertDatabaseCount('project_user', 2);
    $this->assertDatabaseHas('project_user', [
        'project_id' => $project->id,
        'user_id' => $firstUser->id,
    ]);
    $this->assertDatabaseHas('project_user', [
        'project_id' => $project->id,
        'user_id' => $secondUser->id,
    ]);
});

it('returns 422 when adding a user that does not exist', function () {
    $project = Project::factory()->create();

    $response = $this->postJson("/api/projects/{$project->id}/members", [
        'user_id' => 999999,
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['user_id']);
    $this->assertDatabaseCount('project_user', 0);
});

it('assigns a project member to a task', function () {
    $project = Project::factory()->create();
    $member = User::factory()->create();
    $project->members()->attach($member);
    $taskId = DB::table('tasks')->insertGetId([
        'project_id' => $project->id,
        'title' => 'Implement project UI',
        'priority' => 'high',
        'deadline' => '2026-09-15',
        'is_done' => false,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = $this->postJson("/api/tasks/{$taskId}/assignees", [
        'user_id' => $member->id,
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('task_id', $taskId)
        ->assertJsonPath('assignees.0.id', $member->id);
    $this->assertDatabaseHas('task_user', [
        'task_id' => $taskId,
        'user_id' => $member->id,
    ]);
});

it('returns 422 when the assignee is not a project member', function () {
    $project = Project::factory()->create();
    $outsider = User::factory()->create();
    $taskId = DB::table('tasks')->insertGetId([
        'project_id' => $project->id,
        'title' => 'Implement project UI',
        'priority' => 'high',
        'deadline' => '2026-09-15',
        'is_done' => false,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = $this->postJson("/api/tasks/{$taskId}/assignees", [
        'user_id' => $outsider->id,
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['user_id']);
    $this->assertDatabaseCount('task_user', 0);
});

it('returns 422 when assigning a task without a project', function () {
    $user = User::factory()->create();
    $taskId = DB::table('tasks')->insertGetId([
        'project_id' => null,
        'title' => 'Unassigned task',
        'priority' => 'medium',
        'deadline' => '2026-09-15',
        'is_done' => false,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = $this->postJson("/api/tasks/{$taskId}/assignees", [
        'user_id' => $user->id,
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['task']);
    $this->assertDatabaseCount('task_user', 0);
});
