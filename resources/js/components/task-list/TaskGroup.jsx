import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TaskGroup({
    projectId,
    projectName,
    tasks,
    onToggle,
    onDelete,
    onEdit,
}) {
    return (
        <section className="space-y-3">
            <h3 className="font-medium">
                {projectId === 'no-project'
                    ? 'No project'
                    : (projectName ?? `Project #${projectId}`)}
            </h3>
            <ul className="divide-border divide-y rounded-lg border px-4">
                {tasks.map((task) => (
                    <li
                        key={task.id}
                        className="flex flex-wrap items-center gap-3 py-3"
                    >
                        <input
                            type="checkbox"
                            checked={Boolean(task.is_done)}
                            onChange={() => onToggle(task.id)}
                            aria-label={`Mark ${task.title} as ${task.is_done ? 'not done' : 'done'}`}
                            className="accent-primary size-4"
                        />
                        <div className="min-w-0 flex-1">
                            <p
                                className={
                                    task.is_done
                                        ? 'text-muted-foreground line-through'
                                        : 'font-medium'
                                }
                            >
                                {task.title}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Due {task.deadline}
                            </p>
                        </div>
                        <Badge variant="secondary">{task.priority}</Badge>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(task)}
                        >
                            Edit
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(task.id)}
                        >
                            Delete
                        </Button>
                    </li>
                ))}
            </ul>
        </section>
    );
}
