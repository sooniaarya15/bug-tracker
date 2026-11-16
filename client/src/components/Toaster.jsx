import { useEffect, useState } from "react";
import { subscribe } from "../toast";

export default function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(
    () =>
      subscribe((t) => {
        setItems((p) => [...p, t]);
        setTimeout(() => setItems((p) => p.filter((x) => x.id !== t.id)), 3000);
      }),
    []
  );

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {items.map((t) => (
        <div key={t.id}
          className={`rounded-md px-4 py-2 text-sm text-white shadow-lg ${t.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}