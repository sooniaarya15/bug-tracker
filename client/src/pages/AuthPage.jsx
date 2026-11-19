import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Backend jaisa hi rule
const NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateName(value) {
  const name = value.trim().replace(/\s+/g, " ");
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  if (name.length > 50) return "Name must be at most 50 characters";
  if (!NAME_REGEX.test(name)) return "Name can only contain letters and spaces (no numbers or symbols)";
  return "";
}

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function onNameChange(e) {
    const value = e.target.value;
    setForm({ ...form, name: value });
    setNameError(value ? validateName(value) : "");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!isLogin) {
      const nErr = validateName(form.name);
      if (nErr) return setNameError(nErr);
      if (!EMAIL_REGEX.test(form.email.trim())) return setError("Enter a valid email address");
    }

    setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name.trim().replace(/\s+/g, " "), form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6" noValidate>
        <h1 className="text-2xl font-bold">🐛 {isLogin ? "Login" : "Create account"}</h1>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

        {!isLogin && (
          <div>
            <input
              className={`input ${nameError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              placeholder="Full name (sirf letters)"
              value={form.name}
              onChange={onNameChange}
              maxLength={50}
            />
            {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
          </div>
        )}

        <input className="input" type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
        <input className="input" type="password" placeholder="Password (min 6)" value={form.password} onChange={set("password")} required />

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Please wait…" : isLogin ? "Login" : "Register"}
        </button>
        <p className="text-center text-sm text-gray-600">
          {isLogin ? "New user? " : "Already have an account? "}
          <Link className="text-indigo-600 hover:underline" to={isLogin ? "/register" : "/login"}>
            {isLogin ? "Register" : "Login"}
          </Link>
        </p>
      </form>
    </div>
  );
}