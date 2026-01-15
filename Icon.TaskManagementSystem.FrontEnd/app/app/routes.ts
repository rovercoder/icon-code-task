import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/main.tsx"),
    route("tasks", "routes/tasks/tasks.tsx", [
        route("", "routes/tasks/tasks-list.tsx"),
        route("task/:taskId?", "routes/tasks/task-editor.tsx"),
    ])
] satisfies RouteConfig;
