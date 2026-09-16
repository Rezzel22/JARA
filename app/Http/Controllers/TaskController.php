<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        return response()->json(Task::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'title' => ['required', 'string', 'max:255'],
            'priority' => ['required', 'in:low,medium,high'],
            'deadline' => ['required', 'date'],
            'is_done' => ['sometimes', 'boolean'],
        ]);

        $task = Task::create($validated);

        return response()->json($task, 201);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'title' => ['required', 'string', 'max:255'],
            'priority' => ['required', 'in:low,medium,high'],
            'deadline' => ['required', 'date'],
            'is_done' => ['sometimes', 'boolean'],
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function toggleStatus($id)
    {
        $task = Task::findOrFail($id);
        $task->is_done = ! $task->is_done;
        $task->save();

        return response()->json($task);
    }
}
