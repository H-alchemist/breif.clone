<?php

namespace controllers;

use models\ProjectModel;
use models\TaskModel;
use models\AssignTasksModel;
use models\RolePerModel;

/**
 * TaskController handles task-related requests.
 */
class TaskController {
    private $taskModel;
    private $RP;

    private $PA;

    public function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->taskModel = new TaskModel();
        $this->RP = new RolePerModel();
        $this->PA = new ProjectModel();
        
    }

    /**
     * Handles incoming requests.
     */
    public function handleRequest() {
        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new \Exception('Method Not Allowed');
            }

            if (!isset($_SESSION['user'])) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'User not authenticated'
                ]);
                return;
            }

            $rawInput = file_get_contents('php://input');
            $requestData = json_decode($rawInput, true);

            if (!$requestData) {
                throw new \Exception('Invalid JSON in request body');
            }

            $action = $requestData['action'] ?? '';
            $project_id = $requestData['project_id'] ?? null;

            if (!$project_id) {
                throw new \Exception('Project ID is required');
            }

            switch ($action) {
                case 'create':
                    if (!$this->PA->checkAdmin( $project_id, $_SESSION['user']['id']) && !$this->RP->getUserPermissions($_SESSION['user']['id'], $project_id, 'Create')) {
                        http_response_code(403);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Not authorized to create tasks'
                        ]);
                        return;
                    }
                    $this->createTask($requestData);
                    break;

                case 'getTasksByProject':
                    $this->getTasksByProject($project_id);
                    break;

                case 'getTasksByState':
                    $this->getTasksByState($requestData['state']);
                    break;

                case 'updateTask':
                    if (!$this->RP->checkPermission($_SESSION['user_id'], $project_id, 'Edit Tasks')) {
                        http_response_code(403);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Not authorized to update tasks'
                        ]);
                        return;
                    }
                    $this->updateTask($requestData);
                    break;

                case 'deleteTask':
                    if (!$this->RP->checkPermission($_SESSION['user_id'], $project_id, 'Delete Tasks')) {
                        http_response_code(403);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Not authorized to delete tasks'
                        ]);
                        return;
                    }
                    $this->deleteTask($requestData['id']);
                    break;

                case 'assignTask':
                    if (!$this->RP->checkPermission($_SESSION['user_id'], $project_id, 'Assign Tasks')) {
                        http_response_code(403);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Not authorized to assign tasks'
                        ]);
                        return;
                    }
                    $this->assignTask($requestData);
                    break;

                case 'getAssignedUsers':
                    $this->getAssignedUsers($requestData['task_id']);
                    break;

                case 'removeAssignment':
                    if (!$this->RP->checkPermission($_SESSION['user_id'], $project_id, 'Assign Tasks')) {
                        http_response_code(403);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Not authorized to remove task assignments'
                        ]);
                        return;
                    }
                    $this->removeAssignment($requestData);
                    break;

                default:
                    throw new \Exception('Invalid action');
            }
        } catch (\Exception $e) {
            error_log("Error in handleRequest: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Creates a new task.
     *
     * @param array $data Task data.
     */
    private function createTask($data) {
        error_log("Creating task with data: " . print_r($data, true));
        
        if (!isset($data['name'], $data['project_id'], $data['state'])) {
            throw new \Exception('Task name, project ID, and state are required.');
        }

        $result = $this->taskModel->createTask(
            $data['name'],
            $data['description'] ?? null,
            $data['project_id'],
            $data['state'],
            $data['tag'] ?? null,
            $data['deadline'] ?? null
        );

        if (!$result) {
            throw new \Exception('Failed to create task in database');
        }

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Task created successfully'
        ]);
    }

    /**
     * Retrieves tasks by project ID.
     *
     * @param int $projectId Project ID.
     */
    private function getTasksByProject($projectId = null) {
        try {
            if ($projectId === null) {
                $tasks = $this->taskModel->getAllTasks();
            } else {
                $tasks = $this->taskModel->getTasksByProject($projectId);
            }

            // Get assigned users for each task
            foreach ($tasks as &$task) {
                $task['assignedUsers'] = $this->taskModel->getAssignedUsers($task['id']);
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $tasks
            ]);
        } catch (\Exception $e) {
            error_log("Error in getTasksByProject: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Retrieves tasks by state.
     *
     * @param string $state Task state.
     */
    private function getTasksByState($state) {
        if (empty($state)) {
            throw new \Exception('State is required.');
        }

        $tasks = $this->taskModel->getTasksByState($state);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $tasks
        ]);
    }

    /**
     * Updates a task.
     *
     * @param array $data Task data.
     */
    private function updateTask($data) {
        try {
            if (!isset($data['id'])) {
                throw new \Exception('Task ID is required.');
            }

            // Prepare task data with default values
            $taskData = [
                'id' => $data['id'],
                'name' => $data['name'] ?? '',
                'description' => $data['description'] ?? '',
                'state' => $data['state'] ?? 'todo',
                'tag' => $data['tag'] ?? '',
                'deadline' => $data['deadline'] ?? null
            ];

            // Update the task
            $success = $this->taskModel->updateTask(
                $taskData['id'],
                $taskData['name'],
                $taskData['description'],
                $taskData['state'],
                $taskData['tag'],
                $taskData['deadline']
            );

            if (!$success) {
                throw new \Exception('Failed to update task.');
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Task updated successfully'
            ]);
        } catch (\Exception $e) {
            error_log("Error in updateTask: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Deletes a task.
     *
     * @param int $taskId Task ID.
     */
    private function deleteTask($taskId) {
        if (empty($taskId)) {
            throw new \Exception('Task ID is required.');
        }

        $result = $this->taskModel->deleteTask($taskId);
        if (!$result) {
            throw new \Exception('Failed to delete task.');
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Task deleted successfully'
        ]);
    }

    /**
     * Assigns a task to an assignee.
     *
     * @param array $data Task data.
     */
    private function assignTask($data) {
        try {
            if (empty($data['task_id']) || empty($data['assignee'])) {
                throw new \Exception('Task ID and assignee are required');
            }

            $this->taskModel->assignTask($data['task_id'], $data['assignee']);
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Task assigned successfully'
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Retrieves assigned users for a task.
     *
     * @param int $taskId Task ID.
     */
    private function getAssignedUsers($taskId) {
        try {
            if (empty($taskId)) {
                throw new \Exception('Task ID is required');
            }

            $users = $this->taskModel->getAssignedUsers($taskId);
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Removes an assignment from a task.
     *
     * @param array $data Task data.
     */
    private function removeAssignment($data) {
        try {
            if (!isset($data['task_id']) || !isset($data['user_id'])) {
                throw new \Exception('Task ID and user ID are required');
            }

            $this->taskModel->removeAssignment($data['task_id'], $data['user_id']);
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Assignment removed successfully'
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function checkPermission($project_id, $user_id) {
        $role = $this->RP->getRoleByUserId($user_id);
        $permission = $this->RP->getPermissionByRoleAndProject($role, $project_id);
          
        
        


    }





}

?>
