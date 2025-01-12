<?php
namespace views;
use models\TaskModel;
use models\ProjectModel;

// Get project ID from URL
$project_id = $_GET['id'] ?? null;
if (!$project_id) {
    header('Location: /');
    exit();
}

// Get project details
$projectModel = new ProjectModel();
$taskModel = new TaskModel();
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kanban Board</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="css/allStyling.css">
    <link rel="stylesheet" href="css/test.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.3/dragula.min.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-brand">
            <i class="fas fa-tasks"></i>
            <span><a href="/">KanbanFlow</a></span>
        </div>
        <div class="nav-links">
            <a href="/">Projects</a>
            <?php if (isset($_SESSION['user'])): ?>
                <a href="/myproject">My Projects</a>
                <span><?php echo $_SESSION['user']['username']; ?></span>
            <?php endif; ?>
            <div class="nav-right">
                <div class="user-menu">
                    <?php
                    if (isset($_SESSION['user'])) {
                        echo "<a href='logout'><span>Log Out</span></a>"; 
                    } else {
                        echo "<a href='auth'><span>Log In</span></a>"; 
                    }
                    ?>
                </div>
            </div>
        </div>
    </nav>

    <header>
        <h1>Project name</h1>
        <h1>Project owner</h1>
        <button type="button" id="addMembersBtn">Team members</button>
    </header>

    <div class="kanban-board">
        <!-- Todo Column -->
        <div class="board-column" data-state="todo">
            <div class="column-header">To Do</div>
            <div class="tasks-container" id="todo">
                <button class="add-task-btn" data-column="todo">+</button>
            </div>
        </div>
        
        <!-- In Progress Column -->
        <div class="board-column" data-state="inprogress">
            <div class="column-header">In Progress</div>
            <div class="tasks-container" id="inprogress">
                <button class="add-task-btn" data-column="inprogress">+</button>
            </div>
        </div>

        <!-- Review Column -->
        <div class="board-column" data-state="review">
            <div class="column-header">Review</div>
            <div class="tasks-container" id="review">
                <button class="add-task-btn" data-column="review">+</button>
            </div>
        </div>
        
        <!-- Done Column -->
        <div class="board-column" data-state="done">
            <div class="column-header">Done</div>
            <div class="tasks-container" id="done">
                <button class="add-task-btn" data-column="done">+</button>
            </div>
        </div>
    </div>

    <!-- Task Modal -->
    <div id="taskModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Task</h2>
                <button class="close-btn">&times;</button>
            </div>
            <form id="taskForm">
                <div class="form-group">
                    <label for="taskName">Task Name</label>
                    <input type="text" id="taskName" required>
                </div>
                <div class="form-group">
                    <label for="taskDescription">Description</label>
                    <textarea id="taskDescription" required></textarea>
                </div>
                <div class="form-group">
                    <label for="taskDeadline">Deadline</label>
                    <input type="date" id="taskDeadline" required>
                </div>
                <div class="form-group">
                    <label for="taskTag">Tag</label>
                    <select id="taskTag" required>
                        <option value="">Select a tag</option>
                        <option value="Feature">Feature</option>
                        <option value="Bug">Bug</option>
                        <option value="Enhancement">Enhancement</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Testing">Testing</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="assignee">Assign to</label>
                    <select id="assignee" required>
                        <option value="">Select team member</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Create Task</button>
                    <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Add Members Modal -->
    <div id="addMembersModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add Team Members</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="search-section">
                    <input type="text" id="userSearchInput" placeholder="Search users...">
                    <div id="searchResults" class="search-results"></div>
                </div>
                <div class="current-members">
                    <h3>Current Team Members</h3>
                    <div id="teamMembersList"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="secondary-btn" id="cancelMembersBtn">Cancel</button>
                    <button type="button" class="primary-btn" id="saveMembersBtn">Save Changes</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Store project ID for JavaScript use
        const projectId = <?php echo json_encode($project_id); ?>;
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.3/dragula.min.js"></script>
    <script src="js/kanban.js"></script>
</body>
</html>