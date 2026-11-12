import { priorityStyle, typeIcon } from "../constants";

export default function TicketCard({ ticket, onClick, showStatus = false }) {
  return (
    <div
      onClick={() => onClick?.(ticket)}
      className="cursor-pointer rounded-md border border-gray-200 bg-white p-3 text-sm shadow-sm hover:shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-gray-900">{typeIcon[ticket.type]} {ticket.title}</p>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${priorityStyle[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>
      {ticket.description && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{ticket.description}</p>}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{ticket.assignee ? `👤 ${ticket.assignee.name}` : "Unassigned"}</span>
        <span>
          {showStatus && <span className="mr-2 rounded bg-gray-100 px-1.5 py-0.5">{ticket.status}</span>}
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}