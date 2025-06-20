"use client";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getRoleTree, getUsersTree } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import config from "../../../config";

interface TreeNode {
  id: number;
  role?: string;
  text?: string;
  name?: string;
  label?: string;
  parent_role_id?: number | null;
  children: TreeNode[];
  color?: string;
}

// Pastel color palette for levels
const pastelPalette = [
  'hsl(160, 70%, 85%)', // Level 0
  'hsl(250, 70%, 85%)', // Level 1
  'hsl(40, 70%, 85%)',  // Level 2
  'hsl(10, 70%, 85%)',  // Level 3
  'hsl(320, 70%, 85%)', // Level 4
  'hsl(200, 70%, 85%)', // Level 5
];

function transformTreeData(data: any[], isRoleTree: boolean = true): TreeNode[] {
  function getColorByLevel(level: number) {
    return pastelPalette[level % pastelPalette.length];
  }

  function processNode(node: any, level: number = 0): TreeNode {
    return {
      id: node.id,
      role: node.role,
      text: node.text,
      name: node.name,
      label: isRoleTree ? node.role : node.name,
      parent_role_id: node.parent_role_id,
      color: getColorByLevel(level),
      children: node.children ? node.children.map((child: any) => processNode(child, level + 1)) : []
    };
  }

  return data.map(node => processNode(node));
}

function OrgNode({ node }: { node: TreeNode }) {
  const hasChildren = node.children && node.children.length > 0;
  const multipleChildren = node.children && node.children.length > 1;

  // Use the color directly from node.color (now always hsl)
  const customStyle = node.color ? {
    backgroundColor: node.color,
    borderColor: node.color,
  } : {};

  return (
    <div className="flex flex-col items-center relative">
      {/* Node */}
      <div className="flex flex-col items-center relative mb-4">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 min-w-[180px] justify-center`}
          style={customStyle}
        >
          <Avatar className="h-8 w-8 bg-white border border-gray-300">
            <AvatarFallback className="bg-white">
              <User className="h-4 w-4 text-gray-600" />
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm text-gray-800 text-center">
            {node.label || node.text || node.name || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Connectors and Children */}
      {hasChildren && (
        <div className="relative flex flex-col items-center w-full">
          {/* Vertical line down from parent */}
          <div className="w-0.5 h-6 bg-gray-300 mb-2"></div>
          
          {/* Horizontal connector for multiple children */}
          {multipleChildren && (
            <div className="relative w-full flex justify-center mb-2">
              <div 
                className="h-0.5 bg-gray-300 absolute top-0"
                style={{
                  left: '25%',
                  right: '25%',
                }}
              ></div>
            </div>
          )}

          {/* Children container */}
          <div className={`flex ${multipleChildren ? 'gap-8' : 'gap-0'} items-start justify-center w-full`}>
            {node.children.map((child, idx) => (
              <div key={child.id || idx} className="flex flex-col items-center relative">
                {/* Vertical line up to horizontal connector for multiple children */}
                {multipleChildren && (
                  <div className="w-0.5 h-6 bg-gray-300 mb-2"></div>
                )}
                <OrgNode node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const [tab, setTab] = useState("roles");
  const [rolesTree, setRolesTree] = useState<TreeNode[]>([]);
  const [usersTree, setUsersTree] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [roleForm, setRoleForm] = useState({ role: "", text: "", parent_role_id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchTreeData = async () => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication Error",
          description: "Please login to access org chart",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const authHeaders = getAuthHeaders();
      if (!authHeaders) {
        toast({
          title: "Authentication Error", 
          description: "Please login to access org chart",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch roles tree
        const rolesData = await getRoleTree(authHeaders.token, authHeaders.tokenType);
        const transformedRoles = transformTreeData(rolesData, true);
        setRolesTree(transformedRoles);

        // Optionally fetch users tree if endpoint exists
        try {
          const usersData = await getUsersTree(authHeaders.token, authHeaders.tokenType);
          const transformedUsers = transformTreeData(usersData, false);
          setUsersTree(transformedUsers);
        } catch (error) {
          // If users tree endpoint doesn't exist, use empty array or fallback
          console.log("Users tree endpoint not available, using empty data");
          setUsersTree([]);
        }

      } catch (error: any) {
        console.error("Failed to fetch tree data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch organization chart data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTreeData();
  }, [isAuthenticated, getAuthHeaders, toast]);

  // Fetch all roles for parent dropdown
  useEffect(() => {
    const fetchAllRoles = async () => {
      try {
        const authHeaders = getAuthHeaders && getAuthHeaders();
        const res = await fetch(`${config.API_BASE_URL}/user-roles/`, {
          headers: authHeaders ? { Authorization: `${authHeaders.tokenType} ${authHeaders.token}` } : {},
        });
        const data = await res.json();
        if (data.status === "success" && Array.isArray(data.data)) {
          setAllRoles(data.data);
        }
      } catch (err) {
        setAllRoles([]);
      }
    };
    if (showCreateRole) fetchAllRoles();
  }, [showCreateRole, getAuthHeaders]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading organization chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Chart</h1>
          <p className="text-gray-600">View the organizational structure and hierarchy</p>
          <button
            className="absolute right-0 top-0 bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition-all"
            onClick={() => setShowCreateRole(true)}
          >
            + Create Role
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                tab === "roles" 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setTab("roles")}
            >
              Roles Hierarchy
            </button>
            <button
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                tab === "users" 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setTab("users")}
            >
              Users Hierarchy
            </button>
          </div>
        </div>
        
        {/* Org Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 overflow-x-auto">
          {tab === "roles" && (
            <div className="min-w-full">
              {rolesTree.length > 0 ? (
                <div className="flex flex-row items-start justify-center space-x-8">
                  {rolesTree.map((rootNode) => (
                    <OrgNode key={rootNode.id} node={rootNode} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No role hierarchy found</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    The organization role structure is not available or hasn't been configured yet.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {tab === "users" && (
            <div className="min-w-full">
              {usersTree.length > 0 ? (
                <div className="flex flex-col items-center space-y-8">
                  {usersTree.map((rootNode) => (
                    <OrgNode key={rootNode.id} node={rootNode} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No user hierarchy found</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    The user organization structure is not available or the endpoint is not configured.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal for Create Role */}
        {showCreateRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowCreateRole(false)}
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">Create New Role</h2>
              <form
                ref={formRef}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  try {
                    const authHeaders = getAuthHeaders && getAuthHeaders();
                    const payload = {
                      role: roleForm.role,
                      text: roleForm.text,
                      parent_role_id: roleForm.parent_role_id ? Number(roleForm.parent_role_id) : 0,
                    };
                    const res = await fetch(`${config.API_BASE_URL}/user-roles/new`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        ...(authHeaders ? { Authorization: `${authHeaders.tokenType} ${authHeaders.token}` } : {}),
                      },
                      body: JSON.stringify(payload),
                    });
                    const data = await res.json();
                    if (data.status === "success") {
                      setShowCreateRole(false);
                      setRoleForm({ role: "", text: "", parent_role_id: "" });
                      // Refresh org chart
                      if (typeof window !== "undefined") window.location.reload();
                    } else {
                      toast({ title: "Error", description: data.message || "Failed to create role", variant: "destructive" });
                    }
                  } catch (err) {
                    toast({ title: "Error", description: "Failed to create role", variant: "destructive" });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Role Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={roleForm.role}
                    onChange={e => setRoleForm(f => ({ ...f, role: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={roleForm.text}
                    onChange={e => setRoleForm(f => ({ ...f, text: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Parent Role (optional)</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={roleForm.parent_role_id}
                    onChange={e => setRoleForm(f => ({ ...f, parent_role_id: e.target.value }))}
                  >
                    <option value="">None</option>
                    {allRoles.map(r => (
                      <option key={r.id} value={r.id}>{r.role}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Role"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
