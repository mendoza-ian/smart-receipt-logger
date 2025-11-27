import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function AddReceipt() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !amount) return alert("Please enter title and amount");

    const receipts = JSON.parse(localStorage.getItem("receipts") || "[]");
    receipts.unshift({
      id: Date.now(),
      title,
      amount: parseFloat(amount),
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem("receipts", JSON.stringify(receipts));
    navigate("/receipts");
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2>Add Receipt</h2>

      <Card>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
          <Input
            placeholder="Title / Store"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            placeholder="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <Button type="submit">Save</Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setTitle("");
                setAmount("");
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
