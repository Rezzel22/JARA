import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api-fetch';
import {
    type Project,
    type TaskSummary,
    type UserSummary,
    readApiError,
} from './types';

type ProjectMembersProps = {
    project: Project;
    users: UserSummary[];
    tasks: TaskSummary[];
    addMemberUrl: (projectId: number) => string;
    assignTaskUrl: (taskId: number) => string;
    onProjectUpdated: (project: Project) => void;
};

const selectClassName =
    'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

export default function ProjectMembers({
    project,
    users,
    tasks,
    addMemberUrl,
    assignTaskUrl,
    onProjectUpdated,
}: ProjectMembersProps) {
    const availableUsers = useMemo(
        () =>
            users.filter(
                (user) =>
                    !project.members.some((member) => member.id === user.id),
            ),
        [project.members, users],
    );
    const projectTasks = useMemo(
        () => tasks.filter((task) => task.project_id === project.id),
        [project.id, tasks],
    );
    const [memberId, setMemberId] = useState('');
    const [taskId, setTaskId] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [memberError, setMemberError] = useState<string>();
    const [assignmentError, setAssignmentError] = useState<string>();
    const [assignmentMessage, setAssignmentMessage] = useState<string>();
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    async function addMember() {
        setMemberError(undefined);
        setIsAddingMember(true);

        try {
            const response = await apiFetch(addMemberUrl(project.id), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: Number(memberId) }),
            });

            if (!response.ok) {
                const apiError = await readApiError(response);
                setMemberError(
                    apiError.errors?.user_id?.[0] ?? apiError.message,
                );
                return;
            }

            onProjectUpdated((await response.json()) as Project);
            setMemberId('');
        } catch {
            setMemberError('The member could not be added. Please try again.');
        } finally {
            setIsAddingMember(false);
        }
    }

    async function assignTask() {
        setAssignmentError(undefined);
        setAssignmentMessage(undefined);
        setIsAssigning(true);

        try {
            const response = await apiFetch(assignTaskUrl(Number(taskId)), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: Number(assigneeId) }),
            });

            if (!response.ok) {
                const apiError = await readApiError(response);
                setAssignmentError(
                    apiError.errors?.user_id?.[0] ??
                        apiError.errors?.task?.[0] ??
                        apiError.message,
                );
                return;
            }

            setAssignmentMessage('Task assignee saved.');
        } catch {
            setAssignmentError(
                'The task assignee could not be saved. Please try again.',
            );
        } finally {
            setIsAssigning(false);
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                    {project.members.length > 0 ? (
                        project.members.map((member) => (
                            <div key={member.id} className="inline-flex items-center gap-1">
                                <Badge variant="secondary">
                                    {member.name}
                                    <button
                                        type="button"
                                        className="ml-1 hover:text-red-500 font-bold"
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(`/api/projects/${project.id}/members/${member.id}`, {
                                                    method: 'DELETE',
                                                    headers: { Accept: 'application/json' },
                                                });
                                                if (res.ok) {
                                                    onProjectUpdated({
                                                        ...project,
                                                        members: project.members.filter((m) => m.id !== member.id),
                                                    });
                                                }
                                            } catch {}
                                        }}
                                        title="Remove member"
                                    >
                                        &times;
                                    </button>
                                </Badge>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No members yet.
                        </p>
                    )}
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor={`project-${project.id}-member`}>
                            Add member
                        </Label>
                        <select
                            id={`project-${project.id}-member`}
                            value={memberId}
                            onChange={(event) =>
                                setMemberId(event.target.value)
                            }
                            className={selectClassName}
                        >
                            <option value="">Select a user</option>
                            {availableUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={!memberId || isAddingMember}
                        onClick={addMember}
                        className="sm:self-end"
                    >
                        {isAddingMember ? 'Adding...' : 'Add'}
                    </Button>
                </div>
                <InputError message={memberError} />
            </section>

            <section className="border-border flex flex-col gap-3 border-t pt-5">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor={`project-${project.id}-task`}>
                            Task
                        </Label>
                        <select
                            id={`project-${project.id}-task`}
                            value={taskId}
                            onChange={(event) => setTaskId(event.target.value)}
                            className={selectClassName}
                        >
                            <option value="">Select a task</option>
                            {projectTasks.map((task) => (
                                <option key={task.id} value={task.id}>
                                    {task.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor={`project-${project.id}-assignee`}>
                            Assignee
                        </Label>
                        <select
                            id={`project-${project.id}-assignee`}
                            value={assigneeId}
                            onChange={(event) =>
                                setAssigneeId(event.target.value)
                            }
                            className={selectClassName}
                        >
                            <option value="">Select a member</option>
                            {project.members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <Button
                    type="button"
                    disabled={!taskId || !assigneeId || isAssigning}
                    onClick={assignTask}
                    className="self-start"
                >
                    {isAssigning ? 'Assigning...' : 'Assign member'}
                </Button>
                <InputError message={assignmentError} />
                {assignmentMessage ? (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        {assignmentMessage}
                    </p>
                ) : null}
            </section>
        </div>
    );
}
