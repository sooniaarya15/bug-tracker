import Modal from "./Modal";
import Comments from "./Comments";
import { priorityStyle, typeIcon } from "../constants";

export default function TicketModal({ ticket, isAdmin, onClose }) {
  return (
    <Modal title={`${typeIcon[ticket.type]} ${ticket.title}`} onClose={onClose}>
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className={`rounded px-2 py-0.5 font-medium ${priorityStyle[ticket.priority]}`}>{ticket.priority}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5">{ticket.status}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5">{ticket.type}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm">{ticket.description || "No description"}</p>
      <p className="mt-2 text-xs text-gray-500">
        Reported by {ticket.reporter?.name} · Assigned to {ticket.assignee?.name || "nobody"}
      </p>
      <hr className="my-4" />
      <Comments ticketId={ticket._id} isAdmin={isAdmin} />
    </Modal>
  );
}