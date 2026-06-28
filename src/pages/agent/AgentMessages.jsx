import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Messenger from "../../components/Messenger.jsx";
import { getAdminId } from "../../services/messages.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function AgentMessages() {
  const navigate = useNavigate();
  const toast = useToast();

  const messageAdmin = async () => {
    const id = await getAdminId();
    if (!id) {
      toast.error("No admin available yet.");
      return;
    }
    navigate(`/agent/messages?to=${id}&name=Admin`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-charcoal">Messages</h1>
        <button onClick={messageAdmin} className="btn-outline">
          <ShieldCheck className="h-4 w-4" />
          Message Admin
        </button>
      </div>
      <Messenger />
    </div>
  );
}
