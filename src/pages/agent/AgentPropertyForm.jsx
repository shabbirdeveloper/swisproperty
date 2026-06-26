import { useAuth } from "../../context/AuthContext.jsx";
import AdminPropertyForm from "../admin/AdminPropertyForm.jsx";

/**
 * Agent listing editor — reuses the admin property form but locks the
 * listing to the signed-in agent and routes back to the agent dashboard.
 */
export default function AgentPropertyForm() {
  const { agent } = useAuth();

  if (!agent?.id) {
    return <p className="p-8 text-charcoal/50">Loading…</p>;
  }

  return <AdminPropertyForm basePath="/agent" fixedAgentId={agent.id} />;
}
