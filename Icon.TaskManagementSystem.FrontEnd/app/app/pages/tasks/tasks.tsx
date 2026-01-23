import { TasksContext } from "~/contexts/tasks.context";
import { useEffect, useState } from "react";
import type { Task, TaskAllExceptIdOptional, TaskIdOnlyRequired, TaskList } from "~/types/tasks.types";
import type { DetailsForTasks } from "~/types/details.types";
import { useNavigate } from "react-router";
import { noRevalidateQueryParamFull } from "~/utils/routing.utils";
import { tasksListQueryParameterNameForSearch } from "~/routes/tasks/tasks-list.consts";

interface TasksPageProps {
    children: React.ReactNode;
    tasks: TaskList;
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
    const goToTasksList = (options: { withSearchParameters: boolean, isDeleteAction?: boolean }) => {
        const queryParameters = [noRevalidateQueryParamFull];
        if (options?.withSearchParameters?.toString().toLowerCase() === 'true') {
            const searchParams = new URLSearchParams(location.search);
            if (searchParams.has(tasksListQueryParameterNameForSearch)) {
                queryParameters.push(`${tasksListQueryParameterNameForSearch}=${encodeURIComponent(searchParams.get(tasksListQueryParameterNameForSearch) ?? '')}`)
            }
        }
        const queryString = queryParameters.filter(x => !!x && x.toString().trim().length > 0).join('&');
        navigate(`/tasks${(queryString != null && queryString.toString().trim().length > 0) ? `?${queryString.toString().trim()}` : ''}`, options?.isDeleteAction?.toString().toLowerCase() === 'true' ? { replace: true } : {});
    }

    return  <TasksContext.Provider value={{ tasks: tasksList, taskStatuses: details.taskStatuses, addTask, updateTask, deleteTask, refreshAllTasks, goToTasksList }}>
                {children}
            </TasksContext.Provider>
}

export default TasksPage;
