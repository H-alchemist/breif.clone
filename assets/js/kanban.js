// Function to handle API responses and errors
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred');
    }
    return response.json();
}

// Function to show error using SweetAlert
function showError(error) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'An error occurred',
        confirmButtonColor: '#3085d6'
    });
}

// Add task
async function addTask(formData) {
    try {
        const response = await fetch('/task/handleRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'create',
                ...formData
            })
        });

        const data = await handleResponse(response);
        
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Task created successfully',
                confirmButtonColor: '#3085d6'
            }).then(() => {
                // Refresh tasks or update UI
                loadTasks();
            });
        }
        // if (data.status === 403) {
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Error',
        //         text: 'you dont have the permission to add task',
        //         confirmButtonColor: '#3085d6'
        //     }).then(() => {
        //         // Refresh tasks or update UI
        //         loadTasks();
        //     });
            
        // }

    } catch (error) {
        showError(error);
    }
}

// Update task
async function updateTask(taskData) {
    try {
        const response = await fetch('/task/handleRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'updateTask',
                ...taskData
            })
        });

        const data = await handleResponse(response);
        
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Task updated successfully',
                confirmButtonColor: '#3085d6'
            });
        }
    } catch (error) {
        showError(error);
    }
}

// Delete task
async function deleteTask(taskId, projectId) {
    try {
        const response = await fetch('/task/handleRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'deleteTask',
                id: taskId,
                project_id: projectId
            })
        });

        const data = await handleResponse(response);
        
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Task deleted successfully',
                confirmButtonColor: '#3085d6'
            }).then(() => {
                // Refresh tasks or update UI
                loadTasks();
            });
        }
    } catch (error) {
        showError(error);
    }
}

// Assign task
async function assignTask(taskId, assigneeId, projectId) {
    try {
        const response = await fetch('/task/handleRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'assignTask',
                task_id: taskId,
                assignee: assigneeId,
                project_id: projectId
            })
        });

        const data = await handleResponse(response);
        
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Task assigned successfully',
                confirmButtonColor: '#3085d6'
            }).then(() => {
                // Refresh tasks or update UI
                loadTasks();
            });
        }
    } catch (error) {
        showError(error);
    }
}

// Load tasks
async function loadTasks(projectId) {
    try {
        const response = await fetch('/task/handleRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getTasksByProject',
                project_id: projectId
            })
        });

        const data = await handleResponse(response);
        
        if (data.success) {
            // Update UI with tasks
            updateTasksUI(data.data);
        }
    } catch (error) {
        showError(error);
    }
}

// Example of how to use it in your fetch calls:
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('/task/handleRequest', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        const data = await handleResponse(response);
        
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: data.message,
                confirmButtonColor: '#3085d6'
            });
            // Handle success case
        }
    } catch (error) {
        showError(error);
    }
});
