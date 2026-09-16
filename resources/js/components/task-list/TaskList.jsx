import { useEffect, useState } from "react";
import TaskGroup from "./TaskGroup";
import TaskSort from "./TaskSort";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState("priority");
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);

  const loadTasks = () => {
    fetch("/api/tasks", {
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }
        return response.json();
      })
      .then((data) => {
        setTasks(data);
        setError(null);
      })
      .catch(() => setError("Tasks could not be loaded."));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const url = editingId ? `/api/tasks/${editingId}` : "/api/tasks";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title,
        project_id: projectId === "" ? null : Number(projectId),
        priority,
        deadline,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.message || Object.values(data).flat()[0] || "Gagal menyimpan task");
      return;
    }

    setTitle("");
    setProjectId("");
    setPriority("medium");
    setDeadline("");
    setEditingId(null);
    loadTasks();
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setProjectId(task.project_id ?? "");
    setPriority(task.priority);
    setDeadline(task.deadline);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setProjectId("");
    setPriority("medium");
    setDeadline("");
    setFormError(null);
  };

  const handleToggleStatus = async (id) => {
    const res = await fetch(`/api/tasks/${id}/status`, {
      method: "PATCH",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      loadTasks();
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      loadTasks();
    }
  };

  const priorityRank = { high: 0, medium: 1, low: 2 };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "priority") {
      return (priorityRank[a.priority] ?? 2) - (priorityRank[b.priority] ?? 2);
    }
    if (sortBy === "deadline") {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return 0;
  });

  const groupedByProject = sortedTasks.reduce((groups, task) => {
    const key = task.project_id ?? "no-project";
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
    return groups;
  }, {});

  return (
    <div className="task-list">
      <h2>Task List</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ margin: "1rem 0", padding: "1rem", border: "1px solid #ccc" }}>
        <h4>{editingId ? "Edit Task" : "Buat Task Baru"}</h4>
        <div>
          <input
            type="text"
            placeholder="Judul Task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Project ID (opsional)"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
        </div>
        <div>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        <button type="submit">{editingId ? "Simpan Perubahan" : "Tambah Task"}</button>
        {editingId && <button type="button" onClick={handleCancelEdit} style={{ marginLeft: "0.5rem" }}>Batal</button>}
        {formError && <p style={{ color: "red" }}>{formError}</p>}
      </form>

      <TaskSort sortBy={sortBy} onChange={setSortBy} />

      {Object.entries(groupedByProject).map(([projectId, groupTasks]) => (
        <TaskGroup
          key={projectId}
          projectId={projectId}
          tasks={groupTasks}
          onToggle={handleToggleStatus}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
}
