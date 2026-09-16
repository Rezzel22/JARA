<?php

namespace App\Models;

use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property string $name
 * @property int|null $owner_id
 */
#[Fillable(['name', 'owner_id'])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->using(ProjectMember::class)
            ->withPivot(['role']);
    }

    public function isOwner(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        if ($this->owner_id !== null && (int) $this->owner_id === (int) $user->id) {
            return true;
        }

        return $this->members()
            ->where('users.id', $user->id)
            ->wherePivot('role', 'owner')
            ->exists();
    }

    public function isMember(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        if ($this->isOwner($user)) {
            return true;
        }

        return $this->members()
            ->where('users.id', $user->id)
            ->exists();
    }
}
