let counter = 0;

export function generateId() {
  counter += 1;
  return `${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 7)}`;
}
