import { useState } from 'react';
import {
    store,
    update,
    destroy,
    toggleStatus,
} from '@/actions/App/Http/Controllers/TaskController';
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
            const res = await fetch(url, {
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
            const res = await fetch(toggleStatus.url(id), {
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
            const res = await fetch(destroy.url(id), {
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
        <div className="task-list">
            <h2>Task List</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form
                onSubmit={handleSubmit}
                style={{
                    margin: '1rem 0',
                    padding: '1rem',
                    border: '1px solid #ccc',
                }}
            >
                <h4>{editingId ? 'Edit Task' : 'Buat Task Baru'}</h4>
                <div>
                    <input
                        type="text"
                        placeholder="Judul Task"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <select
                        aria-label="Project"
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
                <div>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div>
                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">
                    {editingId ? 'Simpan Perubahan' : 'Tambah Task'}
                </button>
                {editingId && (
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{ marginLeft: '0.5rem' }}
                    >
                        Batal
                    </button>
                )}
                {formError && <p style={{ color: 'red' }}>{formError}</p>}
            </form>

            <TaskSort sortBy={sortBy} onChange={setSortBy} />

            {Object.entries(groupedByProject).map(([projectId, groupTasks]) => (
                <TaskGroup
                    key={projectId}
                    projectId={projectId}
                    projectName={
                        projects.find(
                            (project) => String(project.id) === projectId,
                        )?.name
                    }
                    tasks={groupTasks}
                    onToggle={handleToggleStatus}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />
            ))}
        </div>
    );
}
