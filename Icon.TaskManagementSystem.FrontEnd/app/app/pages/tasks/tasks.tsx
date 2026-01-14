import { TasksContext } from "~/contexts/tasks.context";
import { useEffect, useState } from "react";
import type { Task, TaskIdOnlyRequired } from "~/types/tasks.types";
import type { DetailsForTasks } from "~/types/details.types";
import { useNavigate } from "react-router";
import { noRevalidateQueryParamFull } from "~/utils/routing.utils";

interface TasksPageProps {
    children: React.ReactNode;
    tasks: Task[];
    details: DetailsForTasks;
    refreshAllTasks: () => void;
}

const TasksPage: React.FC<TasksPageProps> = ({children, tasks, details, refreshAllTasks}) => {

    let [tasksList, setTasksLocally] = useState(tasks ?? []);
    useEffect(() => {
        setTasksLocally(tasks ?? []);
    }, [tasks]);

    const addTask = (task: Task) => {
        const _newTasksList = [...tasksList];
        _newTasksList.push(task);
        setTasksLocally(_newTasksList);
    };

    const updateTask = (task: Task) => {
        const _newTasksList = [...tasksList];
        const taskIndex = _newTasksList.findIndex(x => x.id == task.id);
        _newTasksList.splice(taskIndex, 1, task);
        setTasksLocally(_newTasksList);
    };

    const deleteTask = (task: TaskIdOnlyRequired) => {
        setTasksLocally(tasksList.filter(x => x.id != task.id));
    };

    const navigate = useNavigate();
    const goToTasksList = (options?: { isDeleteAction: boolean }) => {
        navigate(`/tasks?${noRevalidateQueryParamFull}`, options?.isDeleteAction?.toString().toLowerCase() === 'true' ? { replace: true } : {});
    }

    return  <TasksContext.Provider value={{ tasks: tasksList, taskStatuses: details.taskStatuses, addTask, updateTask, deleteTask, refreshAllTasks, goToTasksList }}>
                {children}
            </TasksContext.Provider>
}

export default TasksPage;
