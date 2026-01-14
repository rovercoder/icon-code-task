import { Link } from "react-router";
import './task.css';
import { noRevalidateQueryParamFull } from "~/utils/routing.utils";

interface TaskProps {
    id: string;
    title: string;
    description: string;
    status: string;
}

const Task: React.FC<TaskProps> = ({ id, title, description, status }) => {
    return (
        <div className="task">
            <div className="task-header">
                <h3 className="task-title">{title}</h3>
                <Link to={`/tasks/task/${id}?${noRevalidateQueryParamFull}`} className="edit-button" aria-label={`Edit task ${title}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-edit">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </Link>
            </div>
            <p className="task-description">{description}</p>
            <span className="task-status">Status: {status}</span>
        </div>
    );
};

export default Task;
