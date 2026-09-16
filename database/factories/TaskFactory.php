<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'deadline' => fake()->date(),
            'is_done' => fake()->boolean(),
        ];
    }
}
