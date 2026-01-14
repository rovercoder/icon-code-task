import { useContext } from "react";
import { Link } from "react-router";
import Task from "~/components/task/task";
import { TasksContext } from "~/contexts/tasks.context";
import { noRevalidateQueryParamFull } from "~/utils/routing.utils";

export function TasksListPage() {
    const taskContext = useContext(TasksContext);
    if (taskContext == null) {
        throw Error('TasksContext not found in scope.');
    }
    return (
        <div className="tasks-container">
            <div className="tasks-panel">
                <h2>Tasks</h2>
                <Link to={`/tasks/task?${noRevalidateQueryParamFull}`} className="new-task-button">
                    New Task
                </Link>
            </div>
            <div className="tasks-center">
                {
                    taskContext.tasks.map(task => <Task
                        key={task.id}
                        id={task.id}
                        title={task.title}
                        description={task.description}
                        status={taskContext.taskStatuses.find(taskStatus => task.statusId === taskStatus.id)?.name ?? 'Unknown'}
                    />)
                }
            </div>
        </div>
    );
}
