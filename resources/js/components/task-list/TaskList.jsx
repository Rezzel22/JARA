import { useEffect, useState } from "react";
import TaskGroup from "./TaskGroup";
import TaskSort from "./TaskSort";

// Dummy data sementara — ganti ke fetch('/api/tasks') saat Programmer 1 selesai
const dummyTasks = [
  { id: 1, project_id: 1, title: "Setup database", priority: "high", deadline: "2026-09-15", is_done: false },
  { id: 2, project_id: 1, title: "Buat wireframe", priority: "medium", deadline: "2026-09-20", is_done: true },
  { id: 3, project_id: 2, title: "Review API", priority: "low", deadline: "2026-09-18", is_done: false },
];

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState("priority");

  useEffect(() => {
    // Ganti blok ini dengan fetch('/api/tasks') begitu endpoint tersedia
    setTasks(dummyTasks);

    // fetch('/api/tasks')
    //   .then((res) => res.json())
    //   .then((data) => setTasks(data));
  }, []);

  const priorityRank = { high: 0, medium: 1, low: 2 };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "priority") {
      return priorityRank[a.priority] - priorityRank[b.priority];
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
      <TaskSort sortBy={sortBy} onChange={setSortBy} />

      {Object.entries(groupedByProject).map(([projectId, tasks]) => (
        <TaskGroup key={projectId} projectId={projectId} tasks={tasks} />
      ))}
    </div>
  );
}