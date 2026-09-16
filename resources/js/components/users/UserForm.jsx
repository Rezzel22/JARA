import { useState } from 'react';
import { store } from '@/actions/App/Http/Controllers/UserController';

export default function UserForm({ onCreated }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch(store.url(), {
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
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Nama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <button type="submit">Tambah User</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
}
