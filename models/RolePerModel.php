<?php
namespace models;

use config\DB;

class RolePerModel {

    public function checkPermission($user_id, $project_id, $permission_name) {
        // First get the member ID for this user in this project
        $memberQuery = "
            SELECT m.id as member_id 
            FROM members m 
            WHERE m.user_id = :user_id 
            AND m.project_id = :project_id
        ";

        try {
            // Get member ID
            $memberStmt = DB::query($memberQuery, [
                ':user_id' => $user_id,
                ':project_id' => $project_id
            ]);
            $memberResult = $memberStmt->fetch(\PDO::FETCH_ASSOC);

            if (!$memberResult) {
                return false; // User is not a member of this project
            }

            // Now check if this member's role has the required permission
            $permissionQuery = "
                SELECT COUNT(*) as has_permission
                FROM roles r
                JOIN rolPer rp ON r.id = rp.roles_id
                JOIN permissions p ON rp.permission_id = p.id
                WHERE r.member_id = :member_id
                AND p.name = :permission_name
            ";

            $permissionStmt = DB::query($permissionQuery, [
                ':member_id' => $memberResult['member_id'],
                ':permission_name' => $permission_name
            ]);

            $result = $permissionStmt->fetch(\PDO::FETCH_ASSOC);
            return $result['has_permission'] > 0;

        } catch (\PDOException $e) {
            error_log("Error checking permission: " . $e->getMessage());
            return false;
        }
    }

    // Get all permissions for a user in a project
    public function getUserPermissions($user_id, $project_id ,$act) {
        $query = "
            SELECT DISTINCT p.name AS permission_name
FROM members m
JOIN roles r ON m.role_id = r.id
JOIN rolper rp ON r.id = rp.roles_id
JOIN permissions p ON rp.permission_id = p.id
WHERE m.user_id = :user_id
  AND m.project_id = :project_id;
        ";

        try {
            $stmt = DB::query($query, [
                ':user_id' => $user_id,
                ':project_id' => $project_id
            ]);
            
            $res =  $stmt->fetchAll(\PDO::FETCH_COLUMN);

            if (in_array($act, $res)) {
                return true;  // Permission found
            } else {
                return false; // Permission not found
            }



        } catch (\PDOException $e) {
            error_log("Error getting user permissions: " . $e->getMessage());
            return false;
        }
    }

    // Assign a role to a member
    public function assignRole($member_id, $role_name) {
        try {
            // First create the role
            $roleQuery = "INSERT INTO roles (name, member_id) VALUES (:name, :member_id)";
            DB::query($roleQuery, [
                ':name' => $role_name,
                ':member_id' => $member_id
            ]);
            return true;
        } catch (\PDOException $e) {
            error_log("Error assigning role: " . $e->getMessage());
            return false;
        }
    }

    // Assign permissions to a role
    public function assignPermissionToRole($role_id, $permission_name) {
        try {
            // First get the permission ID
            $permQuery = "SELECT id FROM permissions WHERE name = :name";
            $stmt = DB::query($permQuery, [':name' => $permission_name]);
            $perm = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$perm) {
                return false;
            }

            // Now assign the permission to the role
            $assignQuery = "INSERT INTO rolPer (roles_id, permission_id) VALUES (:role_id, :perm_id)";
            DB::query($assignQuery, [
                ':role_id' => $role_id,
                ':perm_id' => $perm['id']
            ]);
            
            return true;
        } catch (\PDOException $e) {
            error_log("Error assigning permission to role: " . $e->getMessage());
            return false;
        }
    }
}