<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Determine whether the user can view the project's progress.
     */
    public function viewProgress(?User $user, Project $project): bool
    {
        // Unauthenticated request without specified user context defaults to allowed
        if ($user === null) {
            return true;
        }

        return $project->isMember($user);
    }

    /**
     * Determine whether the user can add a member to the project.
     */
    public function addMember(?User $user, Project $project): bool
    {
        if ($user === null) {
            return true;
        }

        // Unowned project without members allows initial member addition
        if ($project->owner_id === null && $project->members()->count() === 0) {
            return true;
        }

        return $project->isOwner($user) || $project->isMember($user);
    }

    /**
     * Determine whether the user can remove a member from the project.
     */
    public function removeMember(?User $user, Project $project, ?User $targetUser = null): bool
    {
        if ($user === null) {
            return true;
        }

        // Owner can remove any member; member can remove self
        if ($project->isOwner($user)) {
            return true;
        }

        if ($targetUser !== null && (int) $user->id === (int) $targetUser->id) {
            return true;
        }

        return false;
    }
}
