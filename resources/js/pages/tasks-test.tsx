import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface Task {
    id: number;
    title: string;
    priority: string;
    deadline: string;
    is_done: boolean;
    project_id?: number | null;
}

export default function TasksTest() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('medium');
    const [deadline, setDeadline] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks', {
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error('Failed to fetch tasks');
            const data = await res.json();
            setTasks(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        void fetchTasks();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const payload = { title, priority, deadline };

        try {
            let res;
            if (editingId) {
                res = await fetch(`/api/tasks/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(
                    JSON.stringify(errData.errors || errData.message),
                );
            }

            setTitle('');
            setPriority('medium');
            setDeadline('');
            setEditingId(null);
            void fetchTasks();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = (task: Task) => {
        setEditingId(task.id);
        setTitle(task.title);
        setPriority(task.priority);
        setDeadline(task.deadline);
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error('Failed to delete task');
            void fetchTasks();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            const res = await fetch(`/api/tasks/${id}/status`, {
                method: 'PATCH',
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error('Failed to toggle status');
            void fetchTasks();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <>
            <Head title="Task CRUD & Toggle Test" />
            <div className="mx-auto max-w-4xl p-6 font-sans">
                <h1 className="mb-4 text-2xl font-bold">
                    Task Core - CRUD & Toggle Test
                </h1>

                {error && (
                    <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex-gap mb-6 flex flex-wrap items-center gap-4 rounded bg-white p-4 shadow"
                >
                    <input
                        type="text"
                        placeholder="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="min-w-[200px] flex-1 rounded border p-2"
                        required
                    />
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="rounded border p-2"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="rounded border p-2"
                        required
                    />
                    <button
                        type="submit"
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        {editingId ? 'Update Task' : 'Create Task'}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);
                                setTitle('');
                                setPriority('medium');
                                setDeadline('');
                            }}
                            className="rounded bg-gray-400 px-4 py-2 text-white"
                        >
                            Cancel
                        </button>
                    )}
                </form>

                <div className="overflow-hidden rounded bg-white shadow">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b bg-gray-100">
                                <th className="p-3">Status</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Priority</th>
                                <th className="p-3">Deadline</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-4 text-center text-gray-500"
                                    >
                                        No tasks found.
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr
                                        key={task.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={task.is_done}
                                                onChange={() =>
                                                    handleToggle(task.id)
                                                }
                                                className="size-4 cursor-pointer"
                                            />
                                        </td>
                                        <td
                                            className={`p-3 ${task.is_done ? 'text-gray-400 line-through' : ''}`}
                                        >
                                            {task.title}
                                        </td>
                                        <td className="p-3 capitalize">
                                            {task.priority}
                                        </td>
                                        <td className="p-3">{task.deadline}</td>
                                        <td className="space-x-2 p-3">
                                            <button
                                                onClick={() => handleEdit(task)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(task.id)
                                                }
                                                className="text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
