<?php

use App\Models\Task;
use App\Models\User;

beforeEach(function (): void {
    $this->actingAs(User::factory()->create());
});

test('can list tasks', function () {
    Task::factory()->count(3)->create();

    $response = $this->getJson('/api/tasks');

    $response->assertOk()
        ->assertJsonCount(3);
});

test('can create task with validation', function () {
    $data = [
        'title' => 'Test Task',
        'priority' => 'high',
        'deadline' => '2026-10-01',
    ];

    $response = $this->postJson('/api/tasks', $data);

    $response->assertCreated()
        ->assertJsonFragment(['title' => 'Test Task', 'priority' => 'high']);

    $this->assertDatabaseHas('tasks', ['title' => 'Test Task']);
});

test('task creation validates required fields', function () {
    $response = $this->postJson('/api/tasks', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['title', 'priority', 'deadline']);
});

test('can update task', function () {
    $task = Task::factory()->create([
        'title' => 'Old Title',
        'priority' => 'low',
        'deadline' => '2026-10-01',
    ]);

    $response = $this->putJson("/api/tasks/{$task->id}", [
        'title' => 'Updated Title',
        'priority' => 'medium',
        'deadline' => '2026-10-05',
    ]);

    $response->assertOk()
        ->assertJsonFragment(['title' => 'Updated Title', 'priority' => 'medium']);

    $this->assertDatabaseHas('tasks', ['title' => 'Updated Title']);
});

test('can delete task', function () {
    $task = Task::factory()->create();

    $response = $this->deleteJson("/api/tasks/{$task->id}");

    $response->assertOk();
    $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
});

test('can toggle task status', function () {
    $task = Task::factory()->create(['is_done' => false]);

    $response = $this->patchJson("/api/tasks/{$task->id}/status");

    $response->assertOk()
        ->assertJsonFragment(['is_done' => true]);

    expect($task->fresh()->is_done)->toBeTrue();
});
