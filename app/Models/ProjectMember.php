<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Fillable(['project_id', 'user_id'])]
class ProjectMember extends Pivot
{
    protected $table = 'project_user';
}
