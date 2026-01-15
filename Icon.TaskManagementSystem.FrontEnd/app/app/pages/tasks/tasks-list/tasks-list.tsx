import { useContext } from "react";
import { Link } from "react-router";
import ErrorAlert from "~/components/error-alert/error-alert";
import Task from "~/components/task/task";
import { TasksContext } from "~/contexts/tasks.context";
import { noRevalidateQueryParamFull } from "~/utils/routing.utils";
import './tasks-list.css';

export function TasksListPage() {
    const taskContext = useContext(TasksContext);
    if (taskContext == null) {
        return <ErrorAlert message="TasksContext not found in scope!" />
    }
    return (
        <div className="tasks-container">
            <div className="tasks-panel">
                <h2>Tasks</h2>
                <Link to={`/tasks/task?${noRevalidateQueryParamFull}`} className="new-task-button">
                    New Task
                </Link>
            </div>
            <div className="tasks-list">
                {taskContext.taskStatuses.map(taskStatus => 
                    <div key={taskStatus.id} className="task-status-column" data-task-status-id={taskStatus.id}>
                        <span className="task-status-column-name">{taskStatus.name}</span>
                        <div className="task-status-tasks">
                            { 
                                taskContext.tasks.filter(x => x.statusId == taskStatus.id).map(task => <Task
                                    key={task.id}
                                    id={task.id}
                                    title={task.title}
                                    description={task.description}
                                    status={taskContext.taskStatuses.find(taskStatus => task.statusId === taskStatus.id)?.name ?? 'Unknown'}
                                />)
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
