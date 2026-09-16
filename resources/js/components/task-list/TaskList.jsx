import { useState } from 'react';
import {
    store,
    update,
    destroy,
    toggleStatus,
} from '@/actions/App/Http/Controllers/TaskController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api-fetch';
import TaskGroup from './TaskGroup';
import TaskSort from './TaskSort';

export default function TaskList({ tasks, projects, error, onTasksChanged }) {
    const [sortBy, setSortBy] = useState('priority');

    const [title, setTitle] = useState('');
    const [projectId, setProjectId] = useState('');
    const [priority, setPriority] = useState('medium');
    const [deadline, setDeadline] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        const url = editingId ? update.url(editingId) : store.url();
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await apiFetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    title,
                    project_id: projectId === '' ? null : Number(projectId),
                    priority,
                    deadline,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setFormError(
                    Object.values(data.errors ?? {}).flat()[0] ||
                        data.message ||
                        'Task could not be saved.',
                );
                return;
            }

            setTitle('');
            setProjectId('');
            setPriority('medium');
            setDeadline('');
            setEditingId(null);
            await onTasksChanged();
        } catch {
            setFormError('Task could not be saved.');
        }
    };

    const handleEdit = (task) => {
        setEditingId(task.id);
        setTitle(task.title);
        setProjectId(task.project_id ?? '');
        setPriority(task.priority);
        setDeadline(task.deadline);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setProjectId('');
        setPriority('medium');
        setDeadline('');
        setFormError(null);
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await apiFetch(toggleStatus.url(id), {
                method: 'PATCH',
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error();
            await onTasksChanged();
        } catch {
            setFormError('Task status could not be changed.');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await apiFetch(destroy.url(id), {
                method: 'DELETE',
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error();
            await onTasksChanged();
        } catch {
            setFormError('Task could not be deleted.');
        }
    };

    const priorityRank = { high: 0, medium: 1, low: 2 };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (sortBy === 'priority') {
            return (
                (priorityRank[a.priority] ?? 2) -
                (priorityRank[b.priority] ?? 2)
            );
        }
        if (sortBy === 'deadline') {
            return new Date(a.deadline) - new Date(b.deadline);
        }
        return 0;
    });

    const groupedByProject = sortedTasks.reduce((groups, task) => {
        const key = task.project_id ?? 'no-project';
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
        return groups;
    }, {});

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <p
                        role="alert"
                        className="text-sm text-red-600 dark:text-red-400"
                    >
                        {error}
                    </p>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="bg-muted/40 grid gap-4 rounded-lg border p-4 sm:grid-cols-2"
                >
                    <h3 className="font-medium sm:col-span-2">
                        {editingId ? 'Edit task' : 'Create task'}
                    </h3>
                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="task-title">Title</Label>
                        <Input
                            id="task-title"
                            type="text"
                            placeholder="Task title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="task-project">Project</Label>
                        <select
                            id="task-project"
                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                        >
                            <option value="">No project</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="task-priority">Priority</Label>
                        <select
                            id="task-priority"
                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="task-deadline">Deadline</Label>
                        <Input
                            id="task-deadline"
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <Button type="submit">
                            {editingId ? 'Save changes' : 'Add task'}
                        </Button>
                        {editingId && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                    {formError && (
                        <p
                            role="alert"
                            className="text-sm text-red-600 sm:col-span-2 dark:text-red-400"
                        >
                            {formError}
                        </p>
                    )}
                </form>

                <TaskSort sortBy={sortBy} onChange={setSortBy} />

                {Object.entries(groupedByProject).map(
                    ([projectId, groupTasks]) => (
                        <TaskGroup
                            key={projectId}
                            projectId={projectId}
                            projectName={
                                projects.find(
                                    (project) =>
                                        String(project.id) === projectId,
                                )?.name
                            }
                            tasks={groupTasks}
                            onToggle={handleToggleStatus}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    ),
                )}
            </CardContent>
        </Card>
    );
}
