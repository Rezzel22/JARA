export default function TaskSort({ sortBy, onChange }) {
  return (
    <div className="task-sort">
      <label>Urutkan berdasarkan: </label>
      <select value={sortBy} onChange={(e) => onChange(e.target.value)}>
        <option value="priority">Priority</option>
        <option value="deadline">Deadline</option>
      </select>
    </div>
  );
}