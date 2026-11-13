import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="mb-3 text-sm text-gray-500">
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 && " / "}
          {it.to ? <Link to={it.to} className="hover:underline">{it.label}</Link> : <span className="text-gray-800">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}