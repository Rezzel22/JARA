import { useState } from 'react';
import { store } from '@/actions/App/Http/Controllers/UserController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api-fetch';

export default function UserForm({ onCreated }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await apiFetch(store.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(
                    data.errors?.email?.[0] ||
                        data.errors?.name?.[0] ||
                        data.message ||
                        'User could not be created.',
                );
                return;
            }

            setName('');
            setEmail('');
            await onCreated();
        } catch {
            setError('User could not be created.');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
            <div className="grid gap-2">
                <Label htmlFor="new-user-name">Name</Label>
                <Input
                    id="new-user-name"
                    type="text"
                    placeholder="Alya"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="new-user-email">Email</Label>
                <Input
                    id="new-user-email"
                    type="email"
                    placeholder="alya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <Button type="submit">Add user</Button>
            {error && (
                <div className="sm:col-span-3">
                    <InputError message={error} />
                </div>
            )}
        </form>
    );
}
