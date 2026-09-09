export type UserSummary = {
    id: number;
    name: string;
    email: string;
};

export type Project = {
    id: number;
    name: string;
    members: UserSummary[];
};

export type TaskSummary = {
    id: number;
    project_id: number | null;
    title: string;
};

export type ProjectEndpoints = {
    index: string;
    store: string;
    addMember: (projectId: number) => string;
    assignTask: (taskId: number) => string;
};

export type ApiError = {
    message?: string;
    errors?: Record<string, string[]>;
};

export async function readApiError(response: Response): Promise<ApiError> {
    try {
        return (await response.json()) as ApiError;
    } catch {
        return { message: 'The server returned an unexpected response.' };
    }
}
