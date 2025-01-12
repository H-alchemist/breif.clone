document.addEventListener('DOMContentLoaded', function() {
    // Initialize task tracking
    let tasks = {
        todo: [
            {
                id: "task1",
                title: "Create project plan",
                description: "Define project scope and timeline",
                deadline: "2024-01-15",
                type: "basic"
            },
            {
                id: "task2",
                title: "Research competitors",
                description: "Analyze market competitors",
                deadline: "2024-01-20",
                type: "feature"
            }
        ],
        inprogress: [
            {
                id: "task3",
                title: "Implement login system",
                description: "Create user authentication",
                deadline: "2024-01-25",
                type: "feature"
            }
        ],
        review: [
            {
                id: "task4",
                title: "Code review needed",
                description: "Review pull request #123",
                deadline: "2024-01-10",
                type: "bug"
            }
        ],
        done: [
            {
                id: "task5",
                title: "Setup development environment",
                description: "Configure development tools",
                deadline: "2024-01-05",
                type: "basic"
            }
        ]
    };

    let currentColumn = null;

    // Function to render all tasks
    function renderTasks() {
        // Clear all containers except the add buttons
        Object.keys(tasks).forEach(containerId => {
            const container = document.getElementById(containerId);
            const addButton = container.querySelector('.add-task-btn');
            container.innerHTML = '';
            container.appendChild(addButton);
        });

        // Render tasks from the tasks object
        Object.keys(tasks).forEach(containerId => {
            const container = document.getElementById(containerId);
            const addButton = container.querySelector('.add-task-btn');
            
            tasks[containerId].forEach(taskData => {
                const taskElement = createTaskElement(taskData);
                container.insertBefore(taskElement, addButton);
            });
        });
    }

    // Initialize Dragula
    const containers = [
        document.getElementById('todo'),
        document.getElementById('inprogress'),
        document.getElementById('review'),
        document.getElementById('done')
    ];

    const drake = dragula(containers, {
        moves: function (el) {
            return !el.classList.contains('add-task-btn');
        }
    });

    renderTasks();

    const modal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const cancelBtn = modal.querySelector('.cancel-btn');

    document.querySelectorAll('.add-task-btn').forEach(button => {
        button.addEventListener('click', function() {
            currentColumn = this.closest('.tasks-container').id;
            modal.classList.add('show');
        });
    });

    cancelBtn.addEventListener('click', function() {
        modal.classList.remove('show');
        taskForm.reset();
    });

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const taskId = 'task' + Date.now();
        const taskData = {
            id: taskId,
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            deadline: document.getElementById('taskDeadline').value,
            type: document.getElementById('taskType').value
        };
        
        // Add to tasks array
        tasks[currentColumn].push(taskData);

        // Render all tasks
        renderTasks();

        // Close modal and reset form
        modal.classList.remove('show');
        taskForm.reset();
        
        console.log('Updated tasks:', tasks);
    });

    function createTaskElement(taskData) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.setAttribute('data-task-id', taskData.id);
        taskElement.setAttribute('data-task', JSON.stringify(taskData));

        const date = new Date(taskData.deadline);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        taskElement.innerHTML = `
            <h3>${taskData.title}</h3>
            <p class="task-description">${taskData.description}</p>
            <div class="task-meta">
                <span class="deadline">Due: ${formattedDate}</span>
                <span class="type">${taskData.type}</span>
            </div>
        `;

        return taskElement;
    }

    // Dragula event handlers
    drake.on('drop', function(el, target, source) {
        const taskData = JSON.parse(el.getAttribute('data-task'));
        const sourceId = source.id;
        const targetId = target.id;

        // Remove task from source array
        tasks[sourceId] = tasks[sourceId].filter(task => task.id !== taskData.id);
        
        // Add task to target array
        tasks[targetId].push(taskData);

        // Re-render all tasks to ensure correct order
        renderTasks();

        console.log('Task moved:', {
            task: taskData,
            from: sourceId,
            to: targetId,
            newState: tasks
        });

        // Here you can make an API call to update the backend
        updateBackend(taskData, sourceId, targetId);
    });

    // Function to update backend (placeholder)
    function updateBackend(taskData, sourceId, targetId) {
        // Example API call structure
        /*
        fetch('/api/tasks/move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                task: taskData,
                fromColumn: sourceId,
                toColumn: targetId,
                newState: tasks
            })
        });
        */
    }
});