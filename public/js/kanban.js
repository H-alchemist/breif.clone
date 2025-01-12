// Function to create a task card element
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.setAttribute('data-task-id', task.id);
    card.setAttribute('draggable', 'true');

    // Create project name display if available
    const projectDisplay = task.project_name ? 
        `<div class="task-project">${escapeHtml(task.project_name)}</div>` : '';

    // Create assigned users display
    const assignedUsersDisplay = task.assignedUsers && task.assignedUsers.length > 0 ?
        `<div class="task-assigned">
            <i class="fas fa-users"></i> 
            ${task.assignedUsers.map(user => escapeHtml(user.username || '')).join(', ')}
        </div>` : '';

    // Ensure all task properties have default values
    const taskData = {
        title: task.title || task.name || 'Untitled Task',
        description: task.description || '',
        state: task.state || 'todo',
        deadline: task.deadline || null,
        tag: task.tag || ''
    };

    card.innerHTML = `
        ${projectDisplay}
        <div class="task-header">${escapeHtml(taskData.title)}</div>
        <div class="task-description">${escapeHtml(taskData.description)}</div>
        <div class="task-meta">
            <span class="task-tag">${escapeHtml(taskData.state)}</span>
            ${taskData.deadline ? `<span class="task-deadline">Due: ${new Date(taskData.deadline).toLocaleDateString()}</span>` : ''}
            ${assignedUsersDisplay}
        </div>
        <div class="task-actions">
            <button class="task-action-btn delete-btn" title="Delete Task">
                <i class="fas fa-trash"></i>
            </button>
            <button class="task-action-btn tag-btn" title="Change Tag">
                <i class="fas fa-tag"></i>
            </button>
            <button class="task-action-btn assign-btn" title="Assign User">
                <i class="fas fa-user"></i>
            </button>
        </div>
    `;

    // Add event listeners for buttons
    const deleteBtn = card.querySelector('.delete-btn');
    const tagBtn = card.querySelector('.tag-btn');
    const assignBtn = card.querySelector('.assign-btn');

    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(task.id);
        }
    };

    tagBtn.onclick = (e) => {
        e.stopPropagation();
        showTagModal(task);
    };

    assignBtn.onclick = (e) => {
        e.stopPropagation();
        showAssignModal(task);
    };

    // Add drag and drop functionality
    card.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        card.classList.add('dragging');
    };

    card.ondragend = () => {
        card.classList.remove('dragging');
    };

    return card;
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) {
        return '';
    }
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch('/CRUDTask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'deleteTask',
                id: taskId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Failed to delete task');
        }

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success';
        successMessage.textContent = 'Task deleted successfully!';
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);

        // Reload tasks
        loadTasks();
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-error';
        errorMessage.textContent = 'Error deleting task. Please try again.';
        document.body.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 3000);
    }
}

function showTagModal(task) {
    // Create and show the tag modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = '<h2>Change Tag</h2><button class="close-btn">&times;</button>';

    const form = document.createElement('form');
    form.innerHTML = `
        <div class="form-group">
            <label for="newTag">Select New Tag</label>
            <select id="newTag" required>
                <option value="">Select a tag</option>
                <option value="Feature">Feature</option>
                <option value="Bug">Bug</option>
                <option value="Enhancement">Enhancement</option>
                <option value="Documentation">Documentation</option>
                <option value="Testing">Testing</option>
            </select>
        </div>
        <button type="submit" class="submit-btn">Update Tag</button>
    `;

    content.appendChild(header);
    content.appendChild(form);
    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close button handler
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.onclick = () => {
        modal.remove();
    };

    // Click outside to close
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };

    // Form submit handler
    form.onsubmit = async (e) => {
        e.preventDefault();
        const newTag = document.getElementById('newTag').value;
        
        try {
            const response = await fetch('/CRUDTask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateTask',
                    id: task.id,
                    project_id: projectId,
                    name: task.name || task.title,
                    description: task.description || '',
                    state: task.state || 'todo',
                    tag: newTag,
                    deadline: task.deadline || null
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Network response was not ok');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Failed to update tag');
            }

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.textContent = 'Tag updated successfully!';
            document.body.appendChild(successMessage);
            setTimeout(() => successMessage.remove(), 3000);

            // Close modal and reload tasks
            modal.remove();
            loadTasks();
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-error';
            errorMessage.textContent = error.message || 'Error updating tag. Please try again.';
            document.body.appendChild(errorMessage);
            setTimeout(() => errorMessage.remove(), 3000);
        }
    };
}

async function showAssignModal(task) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
        <h2>Assign Task</h2>
        <button class="close-btn">&times;</button>
    `;
    
    const form = document.createElement('form');
    form.innerHTML = `
        <div class="form-group">
            <label for="assignee" id="assigneeLabel">Assign to</label>
            <select id="assingOne">
                <option value="">Select team member</option>
            </select>
        </div>
        <button type="submit" class="submit-btn">Assign Task</button>
    `;

    // Load team members
    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'getProjectMembers',
            project_id: projectId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success && result.data) {
            const assignSelect = document.getElementById('assingOne');
            // Add team members as options
            result.data.forEach(member => {
                const option = document.createElement('option');
                option.value = member.id;
                option.textContent = member.username;
                assignSelect.appendChild(option);
            });
        }
    })
    .catch(error => console.error('Error loading team members:', error));
    
    modalContent.appendChild(header);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close button functionality
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Click outside to close
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
    
    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const userId = document.getElementById('assingOne').value;
        
        fetch('/CRUDAssing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'assignTask',
                task_id: task.id,
                user_id: userId
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                modal.remove();
                loadTasks(); // Refresh tasks to show new assignment
            } else {
                console.error('Error assigning task:', result.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });
}

async function loadTasks() {
    try {
        console.log('Fetching tasks for project:', projectId);
        const response = await fetch('/CRUDTask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getTasksByProject',
                project_id: projectId
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Raw response:', responseText);

        let result;
        try {
            result = JSON.parse(responseText);
            console.log('Parsed response:', result);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Invalid response format from server');
        }

        if (!result.success) {
            throw new Error(result.message || 'Failed to load tasks');
        }

        // Clear existing tasks
        document.querySelectorAll('.tasks-container').forEach(container => {
            const addButton = container.querySelector('.add-task-btn');
            container.innerHTML = '';
            if (addButton) {
                container.appendChild(addButton);
            }
        });

        // Add tasks to their respective containers
        if (Array.isArray(result.data)) {
            console.log('Tasks to render:', result.data);
            result.data.forEach(task => {
                if (task && task.state) {
                    const container = document.querySelector(`[data-state="${task.state.toLowerCase()}"] .tasks-container`);
                    if (container) {
                        const taskCard = createTaskCard(task);
                        const addButton = container.querySelector('.add-task-btn');
                        container.insertBefore(taskCard, addButton);
                    } else {
                        console.warn('Container not found for state:', task.state);
                    }
                } else {
                    console.warn('Invalid task data:', task);
                }
            });
        } else {
            console.error('No tasks data received or invalid format:', result.data);
        }
    } catch (error) {
        console.error('Error in loadTasks:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger';
        errorMessage.textContent = error.message || 'Error loading tasks. Please try again.';
        document.body.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 3000);
    }
}

// Helper function to get container for state
function getContainerForState(state) {
    const stateToContainer = {
        'To Do': 'todo',
        'In Progress': 'inprogress',
        'Review': 'review',
        'Done': 'done'
    };
    const containerId = stateToContainer[state];
    return containerId ? document.getElementById(containerId) : null;
}

// Initialize dragula for drag and drop
function initializeDragula() {
    const containers = Array.from(document.querySelectorAll('.tasks-container'));
    const drake = dragula(containers, {
        moves: function(el, container, handle) {
            return !handle.classList.contains('add-task-btn'); // Prevent dragging the add button
        }
    });

    // Map container IDs to state names
    const containerIdToState = {
        'todo': 'To Do',
        'inprogress': 'In Progress',
        'review': 'Review',
        'done': 'Done'
    };

    drake.on('drop', async function(el, target, source) {
        const taskId = el.dataset.taskId;
        const newState = containerIdToState[target.id];

        if (!taskId || !newState) {
            console.error('Missing task ID or invalid state');
            loadTasks(); // Revert the move
            return;
        }

        try {
            const response = await fetch('/CRUDTask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateTask',
                    id: taskId,
                    state: newState,
                    project_id: projectId
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Failed to update task state');
            }

            // If successful, leave the task in its new position
        } catch (error) {
            console.error('Error updating task state:', error);
            alert('Failed to update task state. The task will return to its original position.');
            loadTasks(); // Revert the move on error
        }
    });

    return drake;
}

// Initialize the board
document.addEventListener('DOMContentLoaded', function() {
    const drake = initializeDragula();
    loadTasks();

    // Team Members Management
    const addMembersBtn = document.getElementById('addMembersBtn');
    console.log('Add Members Button:', addMembersBtn);

    if (addMembersBtn) {
        addMembersBtn.onclick = function() {
            console.log('Add Members button clicked');
            const modal = document.getElementById('addMembersModal');
            if (modal) {
                modal.style.display = 'block';
                loadCurrentMembers();
            }
        };
    }

    // Get the members modal
    const addMembersModal = document.getElementById('addMembersModal');
    if (addMembersModal) {
        const closeBtn = addMembersModal.querySelector('.close-btn');
        const cancelBtn = document.getElementById('cancelMembersBtn');
        const saveBtn = document.getElementById('saveMembersBtn');

        // Close button handler
        if (closeBtn) {
            closeBtn.onclick = function() {
                addMembersModal.style.display = 'none';
            };
        }

        // Cancel button handler
        if (cancelBtn) {
            cancelBtn.onclick = function() {
                addMembersModal.style.display = 'none';
            };
        }

        // Save button handler
        if (saveBtn) {
            saveBtn.onclick = function() {
                addMembersModal.style.display = 'none';
            };
        }

        const userSearchInput = document.getElementById('userSearchInput');
        if (userSearchInput) {
            userSearchInput.addEventListener('input', debounce(function() {
                const searchTerm = this.value.trim();
                if (searchTerm.length < 2) {
                    const searchResults = document.getElementById('searchResults');
                    if (searchResults) {
                        searchResults.innerHTML = '';
                    }
                    return;
                }
                searchUsers(searchTerm);
            }, 300));
        }
    }

    // Search users function
    function searchUsers(term) {
        fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'searchUsers',
                term: term
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                const searchResults = document.getElementById('searchResults');
                if (!searchResults) return;

                searchResults.innerHTML = '';
                result.data.forEach(user => {
                    const userElement = document.createElement('div');
                    userElement.className = 'user-result';
                    userElement.innerHTML = `
                        <span>${user.username}</span>
                        <button class="add-user-btn" data-user-id="${user.id}">Add</button>
                    `;
                    searchResults.appendChild(userElement);
                });

                // Add click handlers for add buttons
                searchResults.querySelectorAll('.add-user-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const userId = this.dataset.userId;
                        addMemberToProject(userId);
                    });
                });
            } else {
                console.error('Error searching users:', result.message);
            }
        })
        .catch(error => console.error('Error searching users:', error));
    }

    // Add member to project
    function addMemberToProject(userId) {
        fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addMember',
                project_id: projectId,
                user_id: userId
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadCurrentMembers();
                const userSearchInput = document.getElementById('userSearchInput');
                const searchResults = document.getElementById('searchResults');
                if (userSearchInput) userSearchInput.value = '';
                if (searchResults) searchResults.innerHTML = '';
            } else {
                console.error('Error adding member:', result.message);
            }
        })
        .catch(error => console.error('Error adding member:', error));
    }

    // Load current team members
    function loadCurrentMembers() {
        fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getProjectMembers',
                project_id: projectId
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                const teamMembersList = document.getElementById('teamMembersList');
                if (!teamMembersList) return;

                teamMembersList.innerHTML = '';
                result.data.forEach(member => {
                    const memberElement = document.createElement('div');
                    memberElement.className = 'team-member';
                    memberElement.innerHTML = `
                        <span>${member.username}</span>
                        <button class="remove-member-btn" data-user-id="${member.id}">Remove</button>
                    `;
                    teamMembersList.appendChild(memberElement);
                });

                // Add click handlers for remove buttons
                teamMembersList.querySelectorAll('.remove-member-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const userId = this.dataset.userId;
                        removeMemberFromProject(userId);
                    });
                });
            } else {
                console.error('Error loading members:', result.message);
            }
        })
        .catch(error => console.error('Error loading members:', error));
    }

    // Remove member from project
    function removeMemberFromProject(userId) {
        fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'removeMember',
                project_id: projectId,
                user_id: userId
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadCurrentMembers();
            } else {
                console.error('Error removing member:', result.message);
            }
        })
        .catch(error => console.error('Error removing member:', error));
    }

    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Modal functionality
    const modal = document.getElementById('taskModal');
    const addButtons = document.querySelectorAll('.add-task-btn');
    const closeBtn = document.querySelector('.close-btn');
    const taskForm = document.getElementById('taskForm');
    let currentColumn = null;

    // Get project ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
        console.error('Project ID not found in URL');
    }

    // Show modal with column state
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const column = this.dataset.column;
            modal.style.display = 'block';
            currentColumn = column;
            
            // Load team members for assignment
            loadTeamMembersForAssignment();
        });
    });

    // Load team members for task assignment
    function loadTeamMembersForAssignment() {
        fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getProjectMembers',
                project_id: projectId
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                const assigneeSelect = document.getElementById('assignee');
                if (!assigneeSelect) return;

                // Clear existing options except the first one
                while (assigneeSelect.options.length > 1) {
                    assigneeSelect.remove(1);
                }

                // Add team members as options
                result.data.forEach(member => {
                    const option = document.createElement('option');
                    option.value = member.id;
                    option.textContent = member.username;
                    assigneeSelect.appendChild(option);
                });
            } else {
                console.error('Error loading team members for assignment:', result.message);
            }
        })
        .catch(error => console.error('Error loading team members for assignment:', error));
    }

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        taskForm.reset();
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            taskForm.reset();
        }
    });

    // Handle form submission
    taskForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const taskData = {
            name: document.getElementById('taskName').value,
            description: document.getElementById('taskDescription').value,
            deadline: document.getElementById('taskDeadline').value,
            tag: document.getElementById('taskTag').value,
            assignee_id: document.getElementById('assignee').value,
            column: currentColumn,
            project_id: projectId
        };

        try {
            const response = await fetch('/CRUDTask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'create',
                    project_id: projectId,
                    name: taskData.name,
                    description: taskData.description,
                    deadline: taskData.deadline,
                    tag: taskData.tag,
                    assignee_id: taskData.assignee_id,
                    state: taskData.column
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            
            
            if (result.success) {
                // Clear form
                taskForm.reset();
                // Close modal
                modal.style.display = 'none';
                // Reload tasks
                loadTasks();
            } else {
                console.error('Error creating task:', result.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
