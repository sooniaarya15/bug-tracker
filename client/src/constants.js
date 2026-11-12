export const STATUSES = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
];
export const PRIORITIES = ["low", "medium", "high", "critical"];
export const TYPES = ["bug", "feature", "task"];

export const priorityStyle = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};
export const typeIcon = { bug: "🐞", feature: "✨", task: "✅" };