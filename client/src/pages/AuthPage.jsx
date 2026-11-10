import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
        <h1 className="text-2xl font-bold">🐛 {isLogin ? "Login" : "Create account"}</h1>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        {!isLogin && <input className="input" placeholder="Name" value={form.name} onChange={set("name")} required />}
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
        <input className="input" type="password" placeholder="Password (min 6)" value={form.password} onChange={set("password")} required />
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Please wait…" : isLogin ? "Login" : "Register"}
        </button>
        <p className="text-center text-sm text-gray-600">
          {isLogin ? "Naya user? " : "Already account hai? "}
          <Link className="text-indigo-600 hover:underline" to={isLogin ? "/register" : "/login"}>
            {isLogin ? "Register" : "Login"}
          </Link>
        </p>
      </form>
    </div>
  );
}