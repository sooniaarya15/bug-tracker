import { PRIORITIES, STATUSES } from "../constants";

export default function Filters({ filters, setFilters, members, sort, setSort, showSort }) {
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const clear = () => {
    setFilters({ search: "", status: "", priority: "", assignee: "" });
    setSort("default");
  };

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-6">
      <input className="input col-span-2" placeholder="🔍 Search tickets…" value={filters.search} onChange={set("search")} />
      <select className="input" value={filters.status} onChange={set("status")}>
        <option value="">All status</option>
        {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>
      <select className="input" value={filters.priority} onChange={set("priority")}>
        <option value="">All priority</option>
        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <select className="input" value={filters.assignee} onChange={set("assignee")}>
        <option value="">All assignees</option>
        <option value="unassigned">Unassigned</option>
        {members.map((m) => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
      </select>
      {showSort ? (
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">Sort: Default</option>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority">Priority</option>
        </select>
      ) : (
        <button className="btn-secondary" onClick={clear}>Clear</button>
      )}
    </div>
  );
}