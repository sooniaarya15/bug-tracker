import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { STATUSES } from "../constants";
import TicketCard from "./TicketCard";

export default function Board({ tickets, onMove, onSelect, canEdit }) {
  const columns = Object.fromEntries(
    STATUSES.map((s) => [s.key, tickets.filter((t) => t.status === s.key)])
  );

  function onDragEnd({ source, destination }) {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const next = {};
    STATUSES.forEach((s) => (next[s.key] = [...columns[s.key]]));
    const [moved] = next[source.droppableId].splice(source.index, 1);
    next[destination.droppableId].splice(destination.index, 0, { ...moved, status: destination.droppableId });

    onMove(next, [...new Set([source.droppableId, destination.droppableId])]);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 md:grid-cols-3">
        {STATUSES.map((s) => (
          <div key={s.key}>
            <h3 className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-700">
              {s.label}
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs">{columns[s.key].length}</span>
            </h3>
            <Droppable droppableId={s.key}>
              {(prov, snap) => (
                <div
                  ref={prov.innerRef}
                  {...prov.droppableProps}
                  className={`min-h-[200px] space-y-2 rounded-lg p-2 transition ${snap.isDraggingOver ? "bg-indigo-50" : "bg-gray-100"}`}
                >
                  {columns[s.key].map((t, i) => (
                    <Draggable key={t._id} draggableId={t._id} index={i} isDragDisabled={!canEdit}>
                      {(p) => (
                        <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                          <TicketCard ticket={t} onClick={onSelect} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {prov.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}