"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function MatchesPage() {
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/";
      return;
    }

    const currentUser = JSON.parse(storedUser);

    setUser(currentUser);

    loadMatches();
    loadPredictions(currentUser.id);
  }, []);

  async function loadMatches() {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("kickoff");

    setMatches(data || []);
  }

  async function loadPredictions(userId: number) {
    const { data } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId);

    setPredictions(data || []);
  }

  function isMatchClosed(kickoff: string) {
    return new Date(kickoff) <= new Date();
  }

  async function savePrediction(
    matchId: number,
    prediction: string
  ) {
    if (!user) return;

    const match = matches.find(
      (m) => m.id === matchId
    );

    if (
      match &&
      isMatchClosed(match.kickoff)
    ) {
      alert(
        "Pronostici chiusi per questa partita"
      );
      return;
    }

    const existing = await supabase
      .from("predictions")
      .select("id")
      .eq("user_id", user.id)
      .eq("match_id", matchId)
      .maybeSingle();

    if (existing.data) {
      await supabase
        .from("predictions")
        .update({ prediction })
        .eq("id", existing.data.id);
    } else {
      await supabase
        .from("predictions")
        .insert({
          user_id: user.id,
          match_id: matchId,
          prediction,
        });
    }

    await loadPredictions(user.id);
  }

  function logout() {
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  return (
    <div>
      <div
        style={{
          padding: "15px",
          marginBottom: "20px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <a href="/matches">
          🏆 Partite
        </a>

        <a href="/classifica">
          📊 Classifica
        </a>

        <a href="/risultati">
          📋 Risultati
        </a>

        {user?.is_admin && (
          <a href="/admin">
            ⚙️ Admin
          </a>
        )}

        <button
          onClick={logout}
          style={{
            marginLeft: "auto",
            padding: "8px 14px",
            border: "none",
            borderRadius: "6px",
            background: "#ef4444",
            color: "white",
            cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>
      </div>

      <main
        style={{
          padding: "20px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1>🏆 Mondiale 2026</h1>

        {user && (
          <h2>
            Benvenuto {user.name}
          </h2>
        )}

        <hr />

        {matches.map((match) => {
          const prediction =
            predictions.find(
              (p) =>
                p.match_id === match.id
            );

          const closed =
            isMatchClosed(
              match.kickoff
            );

          return (
            <div
              key={match.id}
              style={{
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
                background:
                  closed
                    ? "#fafafa"
                    : "#ffffff",
              }}
            >
              <h3>
                {match.home_team} vs{" "}
                {match.away_team}
              </h3>

              <p>
                🕒{" "}
                {new Date(
                  match.kickoff
                ).toLocaleString()}
              </p>

              <p
                style={{
                  fontWeight: "bold",
                  color: closed
                    ? "#dc2626"
                    : "#16a34a",
                }}
              >
                {closed
                  ? "🔒 Pronostici chiusi"
                  : "✅ Pronostici aperti"}
              </p>

              {match.result && (
                <p
                  style={{
                    fontWeight:
                      "bold",
                    color:
                      "#2563eb",
                  }}
                >
                  Risultato:{" "}
                  {match.result}
                </p>
              )}

              <div
                style={{
                  marginTop: "15px",
                }}
              >
                <button
                  disabled={closed}
                  onClick={() =>
                    savePrediction(
                      match.id,
                      "1"
                    )
                  }
                  style={{
                    background:
                      prediction?.prediction ===
                      "1"
                        ? "#22c55e"
                        : "#e5e7eb",
                    color:
                      prediction?.prediction ===
                      "1"
                        ? "white"
                        : "black",
                    border: "none",
                    padding:
                      "10px 18px",
                    borderRadius:
                      "6px",
                    cursor:
                      closed
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  1
                </button>

                <button
                  disabled={closed}
                  onClick={() =>
                    savePrediction(
                      match.id,
                      "X"
                    )
                  }
                  style={{
                    marginLeft:
                      "10px",
                    background:
                      prediction?.prediction ===
                      "X"
                        ? "#22c55e"
                        : "#e5e7eb",
                    color:
                      prediction?.prediction ===
                      "X"
                        ? "white"
                        : "black",
                    border: "none",
                    padding:
                      "10px 18px",
                    borderRadius:
                      "6px",
                    cursor:
                      closed
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  X
                </button>

                <button
                  disabled={closed}
                  onClick={() =>
                    savePrediction(
                      match.id,
                      "2"
                    )
                  }
                  style={{
                    marginLeft:
                      "10px",
                    background:
                      prediction?.prediction ===
                      "2"
                        ? "#22c55e"
                        : "#e5e7eb",
                    color:
                      prediction?.prediction ===
                      "2"
                        ? "white"
                        : "black",
                    border: "none",
                    padding:
                      "10px 18px",
                    borderRadius:
                      "6px",
                    cursor:
                      closed
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  2
                </button>
              </div>

              {prediction && (
                <p
                  style={{
                    marginTop:
                      "15px",
                    fontWeight:
                      "bold",
                  }}
                >
                  ✅ Il tuo pronostico:
                  {" "}
                  {
                    prediction.prediction
                  }
                </p>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}