"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function RisultatiPage() {
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/";
      return;
    }

    setUser(JSON.parse(storedUser));

    loadData();
  }, []);

  async function loadData() {
    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("kickoff", { ascending: false });

    const { data: predictionsData } = await supabase
      .from("predictions")
      .select("*");

    const { data: usersData } = await supabase
      .from("users")
      .select("*");

    setMatches(matchesData || []);
    setPredictions(predictionsData || []);
    setUsers(usersData || []);
  }

  function logout() {
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  function getUserName(userId: number) {
    const found = users.find(
      (u) => u.id === userId
    );

    return found?.name || "Utente";
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
        <a href="/matches">🏆 Partite</a>

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
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <h1>📋 Risultati e Pronostici</h1>

        {matches
          .filter(
            (match) =>
              match.result &&
              match.home_score !== null &&
              match.away_score !== null
          )
          .map((match) => {
            const matchPredictions =
              predictions.filter(
                (p) =>
                  p.match_id === match.id
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
                  background: "#fff",
                }}
              >
                <h2>
                  {match.home_team} vs{" "}
                  {match.away_team}
                </h2>

                <p>
                  🏁 Risultato finale:{" "}
                  <strong>
                    {match.home_score} -{" "}
                    {match.away_score}
                  </strong>
                </p>

                <p>
                  Esito:{" "}
                  <strong>
                    {match.result}
                  </strong>
                </p>

                <hr />

                <h3>
                  Pronostici utenti
                </h3>

                {matchPredictions.length ===
                0 ? (
                  <p>
                    Nessun pronostico
                  </p>
                ) : (
                  matchPredictions.map(
                    (prediction) => (
                      <div
                        key={
                          prediction.id
                        }
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          padding:
                            "10px 0",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        <span>
                          {getUserName(
                            prediction.user_id
                          )}
                        </span>

                        <span>
                          {
                            prediction.prediction
                          }{" "}
                          {prediction.points >
                          0
                            ? "✅"
                            : "❌"}
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            );
          })}
      </main>
    </div>
  );
}