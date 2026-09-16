export default function TaskGroup({ projectId, tasks, onToggle, onDelete, onEdit }) {
  return (
    <div className="task-group" style={{ margin: "1rem 0" }}>
      <h3>
        {projectId === "no-project" ? "Tanpa Project" : `Project #${projectId}`}
      </h3>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ opacity: task.is_done ? 0.5 : 1, margin: "0.5rem 0" }}>
            <input
              type="checkbox"
              checked={Boolean(task.is_done)}
              onChange={() => onToggle(task.id)}
              style={{ marginRight: "0.5rem" }}
            />
            <strong style={{ textDecoration: task.is_done ? "line-through" : "none" }}>
              {task.title}
            </strong>{" "}
            — {task.priority} — {task.deadline}
            {task.is_done && " ✅"}
            <button onClick={() => onEdit(task)} style={{ marginLeft: "1rem" }}>Edit</button>
            <button onClick={() => onDelete(task.id)} style={{ marginLeft: "0.5rem" }}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
