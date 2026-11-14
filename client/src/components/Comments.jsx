import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Comments({ ticketId, isAdmin }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState("");

  const load = () =>
    api(`/comments?ticket=${ticketId}`).then(setComments).catch((e) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  async function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    try {
      const c = await api("/comments", {
        method: "POST",
        body: { ticket: ticketId, text, parent: replyTo?._id || null },
      });
      setComments((prev) => [...prev, c]);
      setText("");
      setReplyTo(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    try {
      await api(`/comments/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const renderTree = (parentId = null, depth = 0) =>
    comments
      .filter((c) => (c.parent || null) === parentId)
      .map((c) => (
        <div key={c._id} className={depth ? "ml-6 border-l pl-3" : ""}>
          <div className="mb-2 rounded-md bg-gray-50 p-2 text-sm">
            <div className="flex justify-between text-xs text-gray-500">
              <span className="font-medium text-gray-700">{c.author?.name}</span>
              <span>{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap">{c.text}</p>
            <div className="mt-1 flex gap-3 text-xs">
              <button onClick={() => setReplyTo(c)} className="text-indigo-600 hover:underline">Reply</button>
              {(isAdmin || c.author?._id === user._id) && (
                <button onClick={() => remove(c._id)} className="text-red-600 hover:underline">Delete</button>
              )}
            </div>
          </div>
          {renderTree(c._id, depth + 1)}
        </div>
      ));

  return (
    <div>
      <h3 className="mb-2 font-semibold">💬 Comments ({comments.length})</h3>
      {error && <p className="mb-2 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <div className="mb-3 max-h-72 overflow-y-auto">
        {comments.length === 0 ? <p className="text-sm text-gray-400">Abhi koi comment nahi.</p> : renderTree()}
      </div>
      <form onSubmit={add} className="space-y-2">
        {replyTo && (
          <p className="text-xs text-gray-500">
            Replying to <b>{replyTo.author?.name}</b>{" "}
            <button type="button" className="text-red-600" onClick={() => setReplyTo(null)}>cancel</button>
          </p>
        )}
        <textarea className="input" rows={2} placeholder="Write a comment…" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-primary">Post</button>
      </form>
    </div>
  );
}