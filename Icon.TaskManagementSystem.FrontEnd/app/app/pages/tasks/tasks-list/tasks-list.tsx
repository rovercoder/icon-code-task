import { Link } from "react-router";
import TaskComponent from "~/components/organisms/task/task";
import Filter from "~/components/molecules/filter/filter";
import { noRevalidateQueryParamFull } from "~/utils/routing.utils";
import './tasks-list.css';
import { TasksBasedOnStatusQuerySchema, type Task, type TaskList, type TasksBasedOnStatusNonPartialQuery, type TasksBasedOnStatusQuery, type TaskStatusList, TaskSchema, type TasksBasedOnStatusByStatusPartQuery } from "~/types/tasks.types";
import React, { useState } from "react";

interface TasksListPageProps {
    tasks: TaskList;
    taskStatuses: TaskStatusList;
    filterUrlQueryStringPartFull: string;
    filter: TasksBasedOnStatusNonPartialQuery,
    setFilter: (queryCriteria: TasksBasedOnStatusQuery | null | undefined) => void;
    refreshAllTasks: () => void;
    children: React.ReactNode;
}

function taskMatchesCriteria(options: { queryCriteria: TasksBasedOnStatusQuery | null | undefined, task: Task }): boolean | undefined {
    if (options == null || typeof options !== 'object' || (options.queryCriteria != null && !TasksBasedOnStatusQuerySchema.safeParse(options.queryCriteria).success) || !TaskSchema.safeParse(options.task).success) {
        return;
    }

    if (options.queryCriteria == null) {
        return true;
    }

    const queryByGlobalCriteria = options.queryCriteria.global;
    const queryByStatusCriteria = options.queryCriteria.byStatus?.[options.task.statusId];

    const checkFunction = (task: Task, criteria: typeof queryByGlobalCriteria) => {
        return criteria == null 
            || (
                (criteria.description == null || task.description.toLowerCase().includes(criteria.description.toLowerCase()))
                && (criteria.title == null || task.title.toLowerCase().includes(criteria.title.toLowerCase()))
                && (criteria.statusId == null || task.statusId == criteria.statusId)
            );
    };

    return checkFunction(options.task, queryByGlobalCriteria) && checkFunction(options.task, queryByStatusCriteria);
}

export const TasksListPage: React.FC<TasksListPageProps> = ({ tasks, taskStatuses, filterUrlQueryStringPartFull, filter, setFilter, refreshAllTasks, children }) => {
    const [filterInitial, setFilterInitial] = useState(filter);
    
    const getTaskEditorUrl = (taskId?: string | undefined) => {
        const queryString = [filterUrlQueryStringPartFull, noRevalidateQueryParamFull, 'page=dialog'].filter(x => !!x && x.toString().trim().length > 0).join('&');
        return `/tasks/task${taskId != null ? `/${taskId}` : ''}${ (queryString != null && queryString.toString().trim().length > 0) ? `?${queryString.toString().trim()}` : '' }`;
    }

    const handleFilterChangeByStatus = <K extends keyof TasksBasedOnStatusByStatusPartQuery[keyof TasksBasedOnStatusByStatusPartQuery]>(statusId: string, field: K, value: string) => {
        const updatedFilter = {
            ...filter,
            byStatus: {
                ...filter.byStatus,
                [statusId]: { 
                    ...filter.byStatus?.[statusId], 
                    [field]: value 
                }
            }
        };

        function cleanFilterRecursively<T>(obj: T): Partial<T> | null | undefined {
            if (!obj || typeof obj !== 'object') 
                return obj;

            for (const key in obj) {
                if (typeof obj[key] === 'object') {
                    obj[key] = cleanFilterRecursively(obj[key]) as any;
                    if (obj[key] == null || Object.keys(obj[key]).length === 0) {
                        delete obj[key];
                    }
                } else if (obj[key] == null || (typeof obj[key] === 'string' && obj[key] === '')) {
                    delete obj[key];
                }
            }

            if (Object.keys(obj).length === 0) {
                return null;
            }

            return obj;
        };

        setFilter(cleanFilterRecursively(updatedFilter));
    };

    return (
        <div className="tasks-container">
            <div className="tasks-panel">
                <h2>Tasks</h2>
                <Link to={getTaskEditorUrl()} className="new-task-button">
                    New Task
                </Link>
            </div>
            <div className="content grid-overlap">
                <div className="tasks-list">
                    {taskStatuses.map(taskStatus =>
                        <div key={taskStatus.id} className="task-status-column" data-task-status-id={taskStatus.id}>
                            <div className="task-status-column-header">
                                <div className="task-status-column-name">{taskStatus.name}</div>
                                <div className="task-status-search-wrap">
                                    <Filter
                                        onFilterChange={(field, value, type) => handleFilterChangeByStatus(taskStatus.id, field, value)}
                                        fields={
                                            { 
                                                title: {
                                                    name: 'Title',
                                                    initialValue: filterInitial.byStatus?.[taskStatus.id]?.title || '',
                                                    type: 'text'
                                                },
                                                description: {
                                                    name: 'Description',
                                                    initialValue: filterInitial.byStatus?.[taskStatus.id]?.description || '',
                                                    type: 'text'
                                                }
                                            }
                                        }
                                    />
                                </div>
                            </div>
                            <div className="task-status-tasks">
                                {
                                    tasks
                                        .filter(task => task.statusId === taskStatus.id)
                                        .filter(task => taskMatchesCriteria({ queryCriteria: filter, task }))
                                        .map(task => <TaskComponent
                                            key={task.id}
                                            id={task.id}
                                            title={task.title}
                                            description={task.description}
                                            status={taskStatuses.find(ts => ts.id === task.statusId)?.name ?? 'Unknown'}
                                            editorUrl={getTaskEditorUrl(task.id)}
                                        />)
                                }
                            </div>
                        </div>
                    )}
                </div>
                {
                    children && React.Children.count(children) > 0 &&
                        <div className="children">
                            {children}
                        </div>
                }
            </div>
        </div>
    );
}
