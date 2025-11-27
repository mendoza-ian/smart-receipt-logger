export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        padding: "16px",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
      }}
    >
      {children}
    </div>
  );
}
