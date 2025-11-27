export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        background: "white",
        boxShadow: "var(--shadow)",
      }}
    />
  );
}
