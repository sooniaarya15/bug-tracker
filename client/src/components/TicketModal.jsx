import { useState } from "react";
import Modal from "./Modal";
import Comments from "./Comments";
import TicketForm from "./TicketForm";
import { api } from "../api";
import { priorityStyle, typeIcon } from "../constants";

export default function TicketModal({ ticket, project, me, canEdit, isAdmin, onClose, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const canDelete = isAdmin || ticket.reporter?._id === me._id;

  async function save(form) {
    await api(`/tickets/${ticket._id}`, { method: "PUT", body: form });
    // DAY13: toast.success("Ticket updated");
    await onChanged();
    onClose();
  }

  async function remove() {
    try {
      await api(`/tickets/${ticket._id}`, { method: "DELETE" });
      // DAY13: toast.success("Ticket deleted");
      await onChanged();
      onClose();
    } catch (e) {
      setError(e.message);
      setConfirming(false);
    }
  }

  return (
    <Modal title={editing ? "Edit ticket" : `${typeIcon[ticket.type]} ${ticket.title}`} onClose={onClose}>
      {error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      {editing ? (
        <TicketForm
          members={project.members}
          initial={ticket}
          showStatus
          submitLabel="Save changes"
          onSubmit={save}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <span className={`rounded px-2 py-0.5 font-medium ${priorityStyle[ticket.priority]}`}>{ticket.priority}</span>
            <span className="rounded bg-gray-100 px-2 py-0.5">{ticket.status}</span>
            <span className="rounded bg-gray-100 px-2 py-0.5">{ticket.type}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm">{ticket.description || "No description"}</p>
          <p className="mt-2 text-xs text-gray-500">
            Reported by {ticket.reporter?.name} · Assigned to {ticket.assignee?.name || "nobody"}
          </p>

          {(canEdit || canDelete) && !confirming && (
            <div className="mt-4 flex gap-2">
              {canEdit && <button className="btn-secondary" onClick={() => setEditing(true)}>✏️ Edit</button>}
              {canDelete && <button className="btn-danger" onClick={() => setConfirming(true)}>🗑 Delete</button>}
            </div>
          )}

          {confirming && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="mb-2 text-sm text-red-700">Pakka delete karna hai? Comments bhi delete ho jayenge.</p>
              <div className="flex gap-2">
                <button className="btn-danger" onClick={remove}>Yes, delete</button>
                <button className="btn-secondary" onClick={() => setConfirming(false)}>Cancel</button>
              </div>
            </div>
          )}

          <hr className="my-4" />
          <Comments ticketId={ticket._id} isAdmin={isAdmin} />
        </>
      )}
    </Modal>
  );
}