import type { Route } from "../../routes/tasks/+types/tasks-list";
import { Outlet, useSearchParams } from "react-router";
import { useContext } from "react";
import { Result, StatusInternal } from "~/adapters/result";
import { showToastByResult } from "~/components/helpers/toast/toast";
import ErrorAlert from "~/components/helpers/error-alert/error-alert";
import { TasksBasedOnStatusQuerySchema, TaskStatusListSchema, type TasksBasedOnStatusNonPartialQuery, type TasksBasedOnStatusQuery, type TaskStatusList } from "~/types/tasks.types";
import { ToastIdPrefix } from "~/constants/toasts.constants";
import { TasksContext } from "~/contexts/tasks.context";
import { TasksListPage } from "~/pages/tasks/tasks-list/tasks-list";
import { tasksListQueryParameterNameForSearch } from "./tasks-list.consts";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Tasks List" },
        { name: "description", content: "This is the tasks list." },
    ];
}

function getQueryCriteria(options: { currentUrlSearchParameters: URLSearchParams }): TasksBasedOnStatusQuery | undefined {
    if (options == null || typeof options !== 'object' || options.currentUrlSearchParameters == null) {
        return;
    }
    const queryFromUrl = options.currentUrlSearchParameters.get(tasksListQueryParameterNameForSearch);

    let query: TasksBasedOnStatusQuery = {};
    if (queryFromUrl != null && queryFromUrl.toString().length > 0) {
        try {
            const result = TasksBasedOnStatusQuerySchema.safeParse(JSON.parse(queryFromUrl));
            if (result.success) {
                query = result.data;
            }
        }
        catch {
            showToastByResult(ToastIdPrefix.TASKS_LIST_QUERY_MALFORMED, Result.Failure(StatusInternal.VALIDATION_FAILED, 'Query is malformed!'));
        }
    }
    return query;
}

function getQueryCriteriaFull(options: { currentUrlSearchParameters: URLSearchParams, taskStatuses: TaskStatusList }): TasksBasedOnStatusNonPartialQuery | undefined {
    const queryCriteria = getQueryCriteria(options);

    if (queryCriteria == null || !TaskStatusListSchema.safeParse(options.taskStatuses).success) {
        return;
    }

    const _query: TasksBasedOnStatusNonPartialQuery = {
        global: queryCriteria.global ?? {},
        byStatus: {}
    };
    for (const taskStatus of options.taskStatuses) {
        _query.byStatus[taskStatus.id] = queryCriteria.byStatus?.[taskStatus.id] ?? {};
    }
    return _query;
}

export default function TasksList() {

    const taskContext = useContext(TasksContext);
    if (taskContext == null) {
        return <ErrorAlert message="TasksContext not found in scope!" />
    }

    const [searchParams, setSearchParams] = useSearchParams();

    const queryCriteria = getQueryCriteriaFull({ 
        currentUrlSearchParameters: searchParams, 
        taskStatuses: taskContext.taskStatuses 
    });

    const setFilter = (queryCriteria: TasksBasedOnStatusQuery | null | undefined) => {
        const newUrlSearchParams = new URLSearchParams(searchParams);
        if (queryCriteria == null) {
            newUrlSearchParams.delete(tasksListQueryParameterNameForSearch);
        } else {
            newUrlSearchParams.set(tasksListQueryParameterNameForSearch, JSON.stringify(queryCriteria));
        }
        setSearchParams(newUrlSearchParams);
    }

    const queryCriteriaQueryStringParameterFull = !searchParams.has(tasksListQueryParameterNameForSearch) ? '' : `${tasksListQueryParameterNameForSearch}=${encodeURIComponent(searchParams.get(tasksListQueryParameterNameForSearch) ?? '')}`;

    return <TasksListPage filterUrlQueryStringPartFull={queryCriteriaQueryStringParameterFull} filter={queryCriteria ?? { global: {}, byStatus: {} }} setFilter={setFilter} tasks={taskContext.tasks} taskStatuses={taskContext.taskStatuses} refreshAllTasks={taskContext.refreshAllTasks} >
        <Outlet />
    </TasksListPage>
}
