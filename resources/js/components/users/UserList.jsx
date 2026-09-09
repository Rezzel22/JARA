import { useEffect, useState } from "react";
import UserForm from "./UserForm";

export default function UserList() {
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = (id) => {
    fetch(`/api/users/${id}`, { method: "DELETE" }).then(() => loadUsers());
  };

  return (
    <div className="user-list">
      <h2>User Management</h2>
      <UserForm onCreated={loadUsers} />

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleDelete(user.id)}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}