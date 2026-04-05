"use client";

import { useState, useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/stats?days=1")
      .then((res) => setAuthed(res.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  return <Dashboard onLogout={() => setAuthed(false)} />;
}
