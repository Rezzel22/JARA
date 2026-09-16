<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;
    protected $fillable = [
        'project_id',
        'title',
        'priority',
        'deadline',
        'is_done',
    ];

    protected function casts(): array
    {
        return [
            'deadline' => 'date:Y-m-d',
            'is_done' => 'boolean',
        ];
    }
}