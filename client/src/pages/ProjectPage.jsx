import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import MembersPanel from "../components/MembersPanel";

export default function ProjectPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/projects/${id}`).then(setProject).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!project) return <p className="p-6">Loading…</p>;

  const isAdmin = project.members.find((m) => m.user._id === user._id)?.role === "admin";

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-bold">{project.title}</h1>
      <div className="card">
        <MembersPanel project={project} isAdmin={isAdmin} onChange={setProject} />
      </div>
    </div>
  );
}