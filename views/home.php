<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Kanban Boards</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="css/allStyling.css">
    <link rel="stylesheet" href="css/test.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-brand">
            <i class="fas fa-tasks"></i>
            <span><a href="/" class="active">KanbanFlow</a></span>
        </div>
        <div class="nav-links">
            <a href="/" class="active ML_VV"> Projects</a>
            <?php if (isset($_SESSION['user'])): ?>
                <a href="/myproject">My Projects</a>
                <a href="/mytasks">My Tasks</a>
                <span><?php echo $_SESSION['user']['username']  ?></span>
            <?php endif; ?>
            
           
           
            <div class="nav-right">
                <!-- <button id="theme-toggle">
                    <i class="fas fa-moon"></i>
                </button> -->
                <div class="user-menu">
                <?php
                    if (isset($_SESSION['user'])) {
                       echo  "<a href='logout'><span>Log Out</span></a>"; 
                    } else {
                        echo  "<a href='auth'><span>Log in</span></a>"; 
                    }
                    
                   

                    ?>
                </div>
            </div>
        </div>
    </nav>

    <header>
        <h1>Projects</h1>
        
      
        
        
       
    </header>

    <main class="boards-container">

    <?php
    use models\ProjectModel;

    $res = new ProjectModel();
    $kanbans = $res->getPublicProjects();
foreach ($kanbans as $kanban) {
    echo '
    <div class="board-card">
        <div class="board-header">
            <h2>' . htmlspecialchars($kanban['name']) . '</h2>
            <span class="board-type">' . (!empty($kanban['type']) ? htmlspecialchars($kanban['type']) : 'N/A') . '</span>
        </div>
        <div class="board-info">
            <div class="leader-info">
                <div class="leader-details">
                <span class="leader-name" style="display: none;">User ID: ' . htmlspecialchars($kanban['user_id']) . '</span>
                    <span class="leader-name">User ID: ' . htmlspecialchars($kanban['username']) . '</span>
                    <span class="leader-role">Project Lead</span>
                </div>
            </div>
            <div class="board-stats">
                <div class="stat">
                    <span class="stat-number">' . htmlspecialchars($kanban['task_count']) . '</span>
                    <span class="stat-label">Tasks</span>
                </div>
                <div class="stat">
                    <span class="stat-number">' . htmlspecialchars($kanban['member_count']) . '</span>
                    <span class="stat-label">Members</span>
                </div>
            </div>
            <a href="" class="board-link">Ask to join</a>
        </div>
    </div>';
}
?>


        
    </main>

    <!-- New Project Modal -->
    <div class="modal" id="newProjectModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Create New Project</h2>
                <button class="close-btn">&times;</button>
            </div>
            <form id="newProjectForm"  method="POST" action="">
            
                <div class="form-group">
                    <label for="projectName">Project Name</label>
                    <input name="name" type="text" id="projectName" required>
                </div>
                <div class="form-group">
                    <label for="projectType">Project Type</label>
                    <select name="type" id="projectType" required>
                        <option value="public">public</option>
                        <option value="private">private</option>
                     
                    </select>
                </div>
                <div class="form-group">
                    <label for="projectDescription">Description</label>
                    <textarea name="description" id="projectDescrtextarearows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="primary-btn">Create Project</button>
                    <button type="button" class="secondary-btn" id="cancelBtn">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    
</body>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Disable dragging on board cards
    document.querySelectorAll('.board-card').forEach(card => {
        card.draggable = false;
        
        // Prevent dragstart event
        card.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
    });
});
</script>
</html>