import { useState } from 'react';
import { destroy } from '@/actions/App/Http/Controllers/UserController';
import UserForm from './UserForm';

export default function UserList({ users, error, onUsersChanged }) {
    const [actionError, setActionError] = useState('');

    const handleDelete = async (id) => {
        setActionError('');
        try {
            const response = await fetch(destroy.url(id), {
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
        <div className="user-list">
            <h2>User Management</h2>
            <UserForm onCreated={onUsersChanged} />
            {(error || actionError) && (
                <p role="alert" className="text-red-600">
                    {error || actionError}
                </p>
            )}

            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.name} ({user.email})
                        <button onClick={() => handleDelete(user.id)}>
                            Hapus
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
