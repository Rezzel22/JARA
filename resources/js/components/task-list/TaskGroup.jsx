export default function TaskGroup({ projectId, tasks }) {
  return (
    <div className="task-group">
      <h3>
        {projectId === "no-project" ? "Tanpa Project" : `Project #${projectId}`}
      </h3>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ opacity: task.is_done ? 0.5 : 1 }}>
            <strong>{task.title}</strong> — {task.priority} — {task.deadline}
            {task.is_done && " ✅"}
          </li>
        ))}
      </ul>
    </div>
  );
}