import { Label } from '@/components/ui/label';

export default function TaskSort({ sortBy, onChange }) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="task-sort">Sort by</Label>
            <select
                id="task-sort"
                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                value={sortBy}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="priority">Priority</option>
                <option value="deadline">Deadline</option>
            </select>
        </div>
    );
}
