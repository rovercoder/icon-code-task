import { TasksListPage } from "~/pages/tasks/tasks-list/tasks-list";
import type { Route } from "../../routes/tasks/+types/tasks-list";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Tasks List" },
        { name: "description", content: "This is the tasks list." },
    ];
}

export default function TasksList() {
    return <TasksListPage />;
}
