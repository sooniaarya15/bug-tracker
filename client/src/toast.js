const listeners = new Set();
let counter = 0;

function emit(type, message) {
  const t = { id: ++counter, type, message };
  listeners.forEach((l) => l(t));
}

export const toast = {
  success: (m) => emit("success", m),
  error: (m) => emit("error", m),
};

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};