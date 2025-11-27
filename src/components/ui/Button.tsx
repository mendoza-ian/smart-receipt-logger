export default function Button({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" }) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 16px",
        borderRadius: "var(--radius)",
        border: variant === "outline" ? "1px solid var(--border)" : "none",
        background: variant === "outline" ? "transparent" : "var(--primary)",
        color: variant === "outline" ? "var(--text)" : "white",
        cursor: "pointer",
        fontWeight: 500,
        boxShadow: "var(--shadow)",
        transition: "0.2s",
      }}
    >
      {children}
    </button>
  );
}
