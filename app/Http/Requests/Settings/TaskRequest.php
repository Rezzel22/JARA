<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['required', 'exists:projects,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'in:low,medium,high'],
            'deadline' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:todo,in_progress,completed'],
            'assignees' => ['nullable', 'array'],
            'assignees.*' => ['exists:users,id'],
        ];
    }
}