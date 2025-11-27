// src/App.tsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

const Home = lazy(() => import("./pages/Home"));
const AddReceipt = lazy(() => import("./pages/AddReceipt"));
const Receipts = lazy(() => import("./pages/Receipts"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="add" element={<AddReceipt />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
