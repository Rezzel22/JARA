import { useEffect, useState } from 'react';
import {
    type ProjectProgress as ProjectProgressData,
    readApiError,
} from './types';

type ProjectProgressProps = {
    projectId: number;
    progressUrl: (projectId: number) => string;
};

export default function ProjectProgress({
    projectId,
    progressUrl,
}: ProjectProgressProps) {
    const [progress, setProgress] = useState<ProjectProgressData>();
    const [error, setError] = useState<string>();

    useEffect(() => {
        async function loadProgress() {
            try {
                const response = await fetch(progressUrl(projectId), {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    const apiError = await readApiError(response);
                    setError(
                        apiError.message ?? 'Progress could not be loaded.',
                    );
                    return;
                }

                setProgress((await response.json()) as ProjectProgressData);
            } catch {
                setError('Progress could not be loaded.');
            }
        }

        void loadProgress();
    }, [projectId, progressUrl]);

    if (error) {
        return (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        );
    }

    if (!progress) {
        return <div className="bg-muted h-2 animate-pulse rounded-full" />;
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Project progress</span>
                <span className="font-medium">{progress.progress}%</span>
            </div>
            <div
                className="bg-muted h-2 overflow-hidden rounded-full"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress.progress}
                aria-label="Project progress"
            >
                <div
                    className="bg-primary h-full transition-[width]"
                    style={{ width: `${progress.progress}%` }}
                />
            </div>
            <p className="text-muted-foreground text-sm">
                {progress.completed_tasks} of {progress.total_tasks} tasks
                completed
            </p>
        </div>
    );
}
