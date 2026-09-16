import { useCallback, useEffect, useState } from 'react';
import ProjectForm from './ProjectForm';
import ProjectMembers from './ProjectMembers';
import ProjectProgress from './ProjectProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    type Project,
    type ProjectEndpoints,
    type TaskSummary,
    type UserSummary,
    readApiError,
} from './types';

type ProjectListProps = {
    endpoints: ProjectEndpoints;
    users: UserSummary[];
    tasks: TaskSummary[];
    onProjectsChanged: (projects: Project[]) => void;
};

export default function ProjectList({
    endpoints,
    users,
    tasks,
    onProjectsChanged,
}: ProjectListProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState(true);

    const loadProjects = useCallback(async () => {
        setError(undefined);
        setIsLoading(true);

        try {
            const response = await fetch(endpoints.index, {
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const apiError = await readApiError(response);
                setError(apiError.message ?? 'Projects could not be loaded.');
                return;
            }

            const loadedProjects = (await response.json()) as Project[];
            setProjects(loadedProjects);
            onProjectsChanged(loadedProjects);
        } catch {
            setError('Projects could not be loaded. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [endpoints.index, onProjectsChanged]);

    useEffect(() => {
        void loadProjects();
    }, [loadProjects]);

    function updateProject(updatedProject: Project) {
        setProjects((currentProjects) =>
            currentProjects.map((project) =>
                project.id === updatedProject.id ? updatedProject : project,
            ),
        );
    }

    return (
        <section className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create project</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProjectForm
                        storeUrl={endpoints.store}
                        onCreated={() => void loadProjects()}
                    />
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="grid animate-pulse gap-4 md:grid-cols-2">
                    <div className="bg-muted h-64 rounded-xl" />
                    <div className="bg-muted h-64 rounded-xl" />
                </div>
            ) : null}

            {error ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            ) : null}

            {!isLoading && !error && projects.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    No projects have been created.
                </p>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                    <Card key={project.id}>
                        <CardHeader>
                            <CardTitle>{project.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProjectProgress
                                key={tasks
                                    .filter(
                                        (task) =>
                                            task.project_id === project.id,
                                    )
                                    .map((task) => `${task.id}:${task.is_done}`)
                                    .join(',')}
                                projectId={project.id}
                                progressUrl={endpoints.progress}
                            />
                            <div className="my-5 border-t" />
                            <ProjectMembers
                                project={project}
                                users={users}
                                tasks={tasks}
                                addMemberUrl={endpoints.addMember}
                                assignTaskUrl={endpoints.assignTask}
                                onProjectUpdated={updateProject}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
