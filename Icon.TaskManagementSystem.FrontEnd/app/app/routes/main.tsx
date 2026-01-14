import type { Route } from "./+types/main";
import { Welcome } from "../pages/welcome/welcome";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Main() {
    return <Welcome />;
}
