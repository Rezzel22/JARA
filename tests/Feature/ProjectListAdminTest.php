<?php

use App\Models\Project;
use App\Models\Task;
use App\Models\User;

test('pengguna dapat membuat project dan otomatis menjadi owner (SRS-007)', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/projects', [
        'name' => 'Project Uji Coba',
    ]);

    $response->assertStatus(201)
        ->assertJsonFragment(['name' => 'Project Uji Coba']);

    $project = Project::latest()->first();
    expect($project->members()->where('user_id', $user->id)->wherePivot('role', 'owner')->exists())->toBeTrue();
});

test('owner dapat menghapus project beserta cascade data terkait secara atomik (SRS-008)', function () {
    $owner = User::factory()->create();
    $project = Project::create(['name' => 'Project Hapus', 'user_id' => $owner->id]);
    $project->members()->attach($owner->id, ['role' => 'owner']);

    $task = Task::create([
        'project_id' => $project->id,
        'title' => 'Task Test',
        'priority' => 'medium',
        'deadline' => '2026-12-31',
    ]);

    $response = $this->actingAs($owner)->deleteJson("/api/projects/{$project->id}");

    $response->assertStatus(200);
    expect(Project::find($project->id))->toBeNull();
    expect(Task::find($task->id))->toBeNull();
});

test('admin dapat menghapus user dan membersihkan relasi terkait (SRS-011)', function () {
    $admin = User::factory()->create();
    $targetUser = User::factory()->create();

    $response = $this->actingAs($admin)->deleteJson("/api/users/{$targetUser->id}");

    $response->assertStatus(200);
    expect(User::find($targetUser->id))->toBeNull();
});