// routes/tasks/task-editor.tsx
import { Form, useNavigation } from 'react-router';
import { useState } from 'react';
import { taskDescriptionMaxLength, taskDescriptionMinLength, taskTitleMaxLength, taskTitleMinLength, type Task, type TaskAllExceptId, type TaskIdOnlyRequired, type TaskStatusList } from '~/types/tasks.types';
import './task-editor.css';
import { uuidv7 } from '~/utils/uuid.utils';

interface TaskEditorProps {
    task: Task | null;
    taskStatuses: TaskStatusList;
    goToTasksList: (options?: { isDeleteAction: boolean }) => void
}

// 🔹 COMPONENT
const TaskEditorPage: React.FC<TaskEditorProps> = ({ task, taskStatuses, goToTasksList }) => {    
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    const isCreateMode = task == null;

    let taskDetails: TaskAllExceptId = {
        title: '',
        description: '',
        statusId: ''
    };

    if (task != null) {
        const { id: _id, ..._taskDetails } = task;
        taskDetails = _taskDetails;
    }

    // Initialize form state from loader data
    const [formData, setFormData] = useState(taskDetails);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [idempotencyKey, setIdempotencyKey] = useState(uuidv7());

    const changeIdempotencyKey = () => setIdempotencyKey(uuidv7());

    return (
        <div className="task-editor">
            <div className="task-editor-panel">
                <h2>{isCreateMode ? 'Create New Task' : 'Edit Task'}</h2>
            </div>
            <div className='task-form-container'>
                <Form method="post" className="task-form" onSubmit={changeIdempotencyKey}>
                    { task && <input type="hidden" name="taskId" value={task.id} /> }
                    <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            id="title"
                            name="title"
                            minLength={taskTitleMinLength}
                            maxLength={taskTitleMaxLength}
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            minLength={taskDescriptionMinLength}
                            maxLength={taskDescriptionMaxLength}
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="statusId">Status *</label>
                        <select
                            id="statusId"
                            name="statusId"
                            value={formData.statusId}
                            onChange={handleChange}
                            required
                        >
                            {taskStatuses.map(status => (
                                <option key={status.id} value={status.id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="submit" name="saveButton" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : isCreateMode ? 'Create Task' : 'Update Task'}
                        </button>

                        {!isCreateMode && (
                            <button
                                type="submit"
                                name="intent"
                                value="delete"
                                onClick={(e) => {
                                    if (!confirm('Are you sure you want to delete this task?')) {
                                        e.preventDefault();
                                    }
                                }}
                                className="btn-delete"
                            >
                                Delete Task
                            </button>
                        )}

                        <button type="button" onClick={() => goToTasksList()}>
                            Return to Tasks List
                        </button>
                    </div>
                    <input type="hidden" name="intent" value="save" />
                </Form>
            </div>
        </div>
    );
}

export default TaskEditorPage;
