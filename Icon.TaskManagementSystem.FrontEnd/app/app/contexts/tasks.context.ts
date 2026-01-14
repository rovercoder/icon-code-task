import { createContext } from 'react';
import type { Task, TaskIdOnlyRequired, TaskList, TaskStatusList } from '~/types/tasks.types';

export interface TasksState {
    tasks: TaskList;
    taskStatuses: TaskStatusList;
    addTask: (task: Task) => void;
    updateTask: (task: Task) => void;
    deleteTask: (task: TaskIdOnlyRequired) => void;
    refreshAllTasks: () => void;
    goToTasksList: (options?: { isDeleteAction: boolean }) => void;
}

export const TasksContext = createContext<TasksState>({
    tasks: [],
    taskStatuses: [],
    addTask: () => {},
    updateTask: () => {},
    deleteTask: () => {},
    refreshAllTasks: () => {},
    goToTasksList: () => {}
});
