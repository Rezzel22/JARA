import { useState, type FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api-fetch';
import { type Project, readApiError } from './types';

type ProjectFormProps = {
    storeUrl: string;
    onCreated: (project: Project) => void;
};

export default function ProjectForm({ storeUrl, onCreated }: ProjectFormProps) {
    const [name, setName] = useState('');
    const [error, setError] = useState<string>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(undefined);
        setIsSubmitting(true);

        try {
            const response = await apiFetch(storeUrl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                const apiError = await readApiError(response);
                setError(apiError.errors?.name?.[0] ?? apiError.message);
                return;
            }

            const project = (await response.json()) as Project;
            onCreated({ ...project, members: project.members ?? [] });
            setName('');
        } catch {
            setError('Project could not be created. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="project-name">Project name</Label>
                <Input
                    id="project-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Project PPK"
                    maxLength={255}
                    aria-invalid={Boolean(error)}
                />
                <InputError message={error} />
            </div>
            <Button
                type="submit"
                disabled={isSubmitting || name.trim().length === 0}
                className="sm:self-end"
            >
                {isSubmitting ? 'Creating...' : 'Create project'}
            </Button>
        </form>
    );
}
