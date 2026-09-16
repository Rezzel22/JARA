import { useState } from 'react';
import { destroy } from '@/actions/App/Http/Controllers/UserController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api-fetch';
import UserForm from './UserForm';

export default function UserList({ users, error, onUsersChanged }) {
    const [actionError, setActionError] = useState('');

    const handleDelete = async (id) => {
        setActionError('');
        try {
            const response = await apiFetch(destroy.url(id), {
                method: 'DELETE',
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error('User could not be deleted.');
            await onUsersChanged();
        } catch {
            setActionError('User could not be deleted.');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>People</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <UserForm onCreated={onUsersChanged} />
                {(error || actionError) && (
                    <p
                        role="alert"
                        className="text-sm text-red-600 dark:text-red-400"
                    >
                        {error || actionError}
                    </p>
                )}
                <ul className="divide-border divide-y">
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className="flex flex-wrap items-center justify-between gap-3 py-3"
                        >
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-muted-foreground text-sm">
                                    {user.email}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                            >
                                Delete
                            </Button>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
