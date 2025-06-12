// giả lập db
export const codes = Array.from({ length: 600 }, (_, i) =>
  "A" + String(i + 1).padStart(4, "0")
);
