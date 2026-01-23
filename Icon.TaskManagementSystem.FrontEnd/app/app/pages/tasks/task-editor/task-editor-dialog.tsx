import React, { useEffect } from 'react';
import { type Task, type TaskStatusList } from '~/types/tasks.types';
import './task-editor-dialog.css';
import TaskEditor from '~/components/organisms/task-editor/task-editor';

interface TaskEditorProps {
    task: Task | null;
    taskStatuses: TaskStatusList;
    goToTasksList: (options: { withSearchParameters: boolean, isDeleteAction?: boolean }) => void;
    isOpen: boolean;
}

// 🔹 COMPONENT
const TaskEditorDialog: React.FC<TaskEditorProps> = ({ task, taskStatuses, goToTasksList, isOpen }) => {
    const isCreateMode = task == null;

    // Handle Escape key to close dialog
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                goToTasksList({ withSearchParameters: true });
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
            // Prevent scrolling of background when dialog is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            // Restore scrolling when dialog is closed
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, goToTasksList]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="dialog-backdrop" onClick={() => goToTasksList({ withSearchParameters: true })}>
            <div
                className="task-editor-dialog"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="task-editor-title"
            >
                <div className="task-editor-header">
                    <h2 id="task-editor-title">{isCreateMode ? 'Create New Task' : 'Edit Task'}</h2>
                    <button
                        className="close-button"
                        onClick={() => goToTasksList({ withSearchParameters: true })}
                        aria-label="Close dialog"
                    >
                        ×
                    </button>
                </div>
                <div className="task-editor-content">
                    <TaskEditor task={task} taskStatuses={taskStatuses} goToTasksList={goToTasksList} />
                </div>
            </div>
        </div>
    );
}

export default TaskEditorDialog;
