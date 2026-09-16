<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('redirects guests to login before showing JARA', function () {
    $this->get('/')->assertRedirect(route('login'));
    $this->getJson('/api/projects')->assertUnauthorized();
    $this->postJson('/api/tasks', [])->assertUnauthorized();
});

it('serves JARA to authenticated users', function () {
    $this->withoutVite();
    $this->actingAs(User::factory()->create());

    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->component('jara'));
});

it('creates and lists a user without exposing an account password', function () {
    $this->actingAs(User::factory()->create());
    $user = $this->postJson('/api/users', [
        'name' => 'Alya',
        'email' => 'alya@example.com',
    ])->assertCreated()
        ->assertJsonPath('name', 'Alya')
        ->assertJsonMissingPath('password')
        ->json();

    $this->getJson('/api/users')->assertOk()->assertJsonFragment(['id' => $user['id']]);
    $this->assertDatabaseHas('users', ['id' => $user['id'], 'email' => 'alya@example.com']);

    $this->postJson('/api/users', [
        'name' => 'Another Alya',
        'email' => 'alya@example.com',
    ])->assertUnprocessable()->assertJsonValidationErrors(['email']);

    $this->deleteJson("/api/users/{$user['id']}")->assertOk();
    $this->assertDatabaseMissing('users', ['id' => $user['id']]);
});

it('completes the project, member, task, assignee, and progress flow', function () {
    $this->actingAs(User::factory()->create());
    $userId = $this->postJson('/api/users', [
        'name' => 'Alya',
        'email' => 'alya@example.com',
    ])->assertCreated()->json('id');

    $projectId = $this->postJson('/api/projects', ['name' => 'Demo PBP'])
        ->assertCreated()->json('id');

    $this->postJson("/api/projects/{$projectId}/members", [
        'user_id' => $userId,
    ])->assertOk()->assertJsonPath('members.0.id', $userId);

    $taskId = $this->postJson('/api/tasks', [
        'project_id' => $projectId,
        'title' => 'Finish demo',
        'priority' => 'high',
        'deadline' => '2026-10-01',
    ])->assertCreated()->json('id');

    $this->postJson("/api/tasks/{$taskId}/assignees", [
        'user_id' => $userId,
    ])->assertOk()->assertJsonPath('assignees.0.id', $userId);

    $this->getJson("/api/projects/{$projectId}/progress")
        ->assertOk()->assertJsonPath('progress', 0);

    $this->patchJson("/api/tasks/{$taskId}/status")->assertOk()
        ->assertJsonPath('is_done', true);

    $this->getJson("/api/projects/{$projectId}/progress")
        ->assertOk()->assertJsonPath('total_tasks', 1)
        ->assertJsonPath('completed_tasks', 1)
        ->assertJsonPath('progress', 100);

    $this->putJson("/api/tasks/{$taskId}", [
        'project_id' => $projectId,
        'title' => 'Present demo',
        'priority' => 'medium',
        'deadline' => '2026-10-02',
    ])->assertOk()->assertJsonPath('title', 'Present demo');

    $this->deleteJson("/api/tasks/{$taskId}")->assertOk();
    $this->assertDatabaseMissing('tasks', ['id' => $taskId]);
});
