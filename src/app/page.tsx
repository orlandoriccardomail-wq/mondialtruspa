"use client";

import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("pin", pin)
      .single();

    if (!data) {
      setError("PIN non valido");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));

    window.location.href = "/matches";
  };

  return (
    <main style={{ padding: 30 }}>
      <h1>🏆 Mondiale 2026</h1>

      <input
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="PIN"
      />

      <button onClick={login}>
        Entra
      </button>

      <p>{error}</p>
    </main>
  );
}