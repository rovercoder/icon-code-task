import { type Task, type TaskStatusList } from '~/types/tasks.types';
import './task-editor-page.css';
import TaskEditor from '~/components/organisms/task-editor/task-editor';

interface TaskEditorProps {
    task: Task | null;
    taskStatuses: TaskStatusList;
    goToTasksList: (options: { withSearchParameters: boolean, isDeleteAction?: boolean }) => void
}

// 🔹 COMPONENT
const TaskEditorPage: React.FC<TaskEditorProps> = ({ task, taskStatuses, goToTasksList }) => {
    const isCreateMode = task == null;

    return (
        <div className="task-editor-page">
            <div className="task-editor-panel">
                <h2>{isCreateMode ? 'Create New Task' : 'Edit Task'}</h2>
            </div>
            <TaskEditor task={task} taskStatuses={taskStatuses} goToTasksList={goToTasksList} />
        </div>
    );
}

export default TaskEditorPage;
