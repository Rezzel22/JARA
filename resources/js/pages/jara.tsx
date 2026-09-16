import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import * as projectActions from '@/actions/App/Http/Controllers/ProjectController';
import * as taskActions from '@/actions/App/Http/Controllers/TaskController';
import * as userActions from '@/actions/App/Http/Controllers/UserController';
import ProjectList from '@/components/projects/ProjectList';
import type {
    Project,
    TaskSummary,
    UserSummary,
} from '@/components/projects/types';
import TaskList from '@/components/task-list/TaskList';
import UserList from '@/components/users/UserList';

const projectEndpoints = {
    index: projectActions.index.url(),
    store: projectActions.store.url(),
    progress: (projectId: number) => projectActions.progress.url(projectId),
    addMember: (projectId: number) => projectActions.addMember.url(projectId),
    assignTask: (taskId: number) => projectActions.assignTask.url(taskId),
};

export default function Jara() {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [tasks, setTasks] = useState<TaskSummary[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [userError, setUserError] = useState('');
    const [taskError, setTaskError] = useState('');

    const loadUsers = useCallback(async () => {
        try {
            const response = await fetch(userActions.index.url(), {
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error('Users could not be loaded.');
            setUsers((await response.json()) as UserSummary[]);
            setUserError('');
        } catch {
            setUserError('Users could not be loaded.');
        }
    }, []);

    const loadTasks = useCallback(async () => {
        try {
            const response = await fetch(taskActions.index.url(), {
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error('Tasks could not be loaded.');
            setTasks((await response.json()) as TaskSummary[]);
            setTaskError('');
        } catch {
            setTaskError('Tasks could not be loaded.');
        }
    }, []);

    useEffect(() => {
        void loadUsers();
        void loadTasks();
    }, [loadUsers, loadTasks]);

    return (
        <main className="bg-background text-foreground min-h-screen px-4 py-8 sm:px-8">
            <Head title="JARA" />
            <div className="mx-auto flex max-w-6xl flex-col gap-8">
                <header>
                    <h1 className="text-3xl font-semibold">JARA</h1>
                    <p className="text-muted-foreground">
                        Projects, people, and tasks
                    </p>
                </header>
                <UserList
                    users={users}
                    error={userError}
                    onUsersChanged={loadUsers}
                />
                <ProjectList
                    endpoints={projectEndpoints}
                    users={users}
                    tasks={tasks}
                    onProjectsChanged={setProjects}
                />
                <TaskList
                    tasks={tasks}
                    projects={projects}
                    error={taskError}
                    onTasksChanged={loadTasks}
                />
            </div>
        </main>
    );
}
