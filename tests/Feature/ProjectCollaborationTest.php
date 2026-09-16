<?php

use App\Models\Project;
use App\Models\Task;
use App\Models\User;

it('calculates project task progress accurately (SRS-010)', function () {
    $owner = User::factory()->create(['name' => 'Owner']);
    $member = User::factory()->create(['name' => 'Member']);

    $project = Project::create(['name' => 'Collaboration Project', 'owner_id' => $owner->id]);
    $project->members()->attach($owner->id, ['role' => 'owner']);
    $project->members()->attach($member->id, ['role' => 'member']);

    // Initially 0 tasks
    $this->withHeader('X-User-Id', (string) $member->id)
        ->getJson("/api/projects/{$project->id}/progress")
        ->assertOk()
        ->assertJson([
            'project_id' => $project->id,
            'total_tasks' => 0,
            'completed_tasks' => 0,
            'progress' => 0,
        ]);

    // Create 2 tasks, 1 completed
    $task1 = Task::create([
        'project_id' => $project->id,
        'title' => 'Task 1',
        'priority' => 'high',
        'deadline' => '2026-10-10',
        'is_done' => true,
    ]);

    $task2 = Task::create([
        'project_id' => $project->id,
        'title' => 'Task 2',
        'priority' => 'medium',
        'deadline' => '2026-10-12',
        'is_done' => false,
    ]);

    // Another project's task to ensure scoping
    $otherProject = Project::create(['name' => 'Other Project']);
    Task::create([
        'project_id' => $otherProject->id,
        'title' => 'Unrelated Task',
        'priority' => 'low',
        'deadline' => '2026-10-15',
        'is_done' => true,
    ]);

    $this->withHeader('X-User-Id', (string) $owner->id)
        ->getJson("/api/projects/{$project->id}/progress")
        ->assertOk()
        ->assertJson([
            'project_id' => $project->id,
            'total_tasks' => 2,
            'completed_tasks' => 1,
            'progress' => 50,
        ]);

    // Toggle task 2 status to complete
    $this->patchJson("/api/tasks/{$task2->id}/status")->assertOk();

    $this->withHeader('X-User-Id', (string) $member->id)
        ->getJson("/api/projects/{$project->id}/progress")
        ->assertOk()
        ->assertJson([
            'project_id' => $project->id,
            'total_tasks' => 2,
            'completed_tasks' => 2,
            'progress' => 100,
        ]);
});

it('enforces role-based authorization for project collaboration (SRS-009)', function () {
    $owner = User::factory()->create(['name' => 'Project Owner']);
    $member = User::factory()->create(['name' => 'Project Member']);
    $stranger = User::factory()->create(['name' => 'Stranger']);
    $newUser = User::factory()->create(['name' => 'New User']);

    $project = Project::create(['name' => 'Secret Project', 'owner_id' => $owner->id]);
    $project->members()->attach($owner->id, ['role' => 'owner']);
    $project->members()->attach($member->id, ['role' => 'member']);

    // Non-member is forbidden from viewing progress
    $this->withHeader('X-User-Id', (string) $stranger->id)
        ->getJson("/api/projects/{$project->id}/progress")
        ->assertForbidden();

    // Owner can add a member
    $this->withHeader('X-User-Id', (string) $owner->id)
        ->postJson("/api/projects/{$project->id}/members", ['user_id' => $newUser->id])
        ->assertOk()
        ->assertJsonFragment(['id' => $newUser->id, 'name' => 'New User']);

    // Non-owner member cannot remove another member
    $this->withHeader('X-User-Id', (string) $member->id)
        ->deleteJson("/api/projects/{$project->id}/members/{$newUser->id}")
        ->assertForbidden();

    // Owner can remove a member
    $this->withHeader('X-User-Id', (string) $owner->id)
        ->deleteJson("/api/projects/{$project->id}/members/{$newUser->id}")
        ->assertOk()
        ->assertJson(['message' => 'Member removed successfully.']);

    // Non-existent project returns 404
    $this->withHeader('X-User-Id', (string) $owner->id)
        ->getJson('/api/projects/99999/progress')
        ->assertNotFound();
});

it('validates inputs when managing project members (SRS-012)', function () {
    $project = Project::create(['name' => 'Validation Project']);

    // Adding member without user_id
    $this->postJson("/api/projects/{$project->id}/members", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['user_id']);

    // Adding member with non-existent user_id
    $this->postJson("/api/projects/{$project->id}/members", ['user_id' => 99999])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['user_id']);

    // Removing member with invalid target user_id
    $this->deleteJson("/api/projects/{$project->id}/members/99999")
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['target_user_id']);
});

it('prevents SQL injection on collaboration endpoints (SRS-013)', function () {
    $project = Project::create(['name' => 'Safe Project']);

    $this->postJson("/api/projects/{$project->id}/members", [
        'user_id' => "1' OR '1'='1",
    ])->assertUnprocessable();

    $this->getJson("/api/projects/{$project->id}' OR '1'='1/progress")
        ->assertNotFound();
});
