import { useState } from "react";
import { PRIORITIES, STATUSES, TYPES } from "../constants";

export default function TicketForm({ members, initial = {}, onSubmit, onCancel, submitLabel = "Create", showStatus = false }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    type: initial.type || "bug",
    priority: initial.priority || "medium",
    status: initial.status || "todo",
    assignee: initial.assignee?._id || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <input className="input" placeholder="Title *" value={form.title} onChange={set("title")} required />
      <textarea className="input" rows={3} placeholder="Description / steps to reproduce" value={form.description} onChange={set("description")} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select className="input" value={form.type} onChange={set("type")}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input" value={form.priority} onChange={set("priority")}>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="input" value={form.assignee} onChange={set("assignee")}>
          <option value="">Unassigned</option>
          {members.map((m) => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
        </select>
        {showStatus && (
          <select className="input" value={form.status} onChange={set("status")}>
            {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        )}
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>}
        <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : submitLabel}</button>
      </div>
    </form>
  );
}