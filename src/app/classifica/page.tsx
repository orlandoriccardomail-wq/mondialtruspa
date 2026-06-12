"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ClassificaPage() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/";
      return;
    }

    const currentUser =
      JSON.parse(storedUser);

    setUser(currentUser);

    load();
  }, []);

  async function load() {
    const { data: users } =
      await supabase
        .from("users")
        .select("*");

    const { data: predictions } =
      await supabase
        .from("predictions")
        .select("*");

    if (!users || !predictions)
      return;

    const rows = users.map(
      (user) => {
        const userPredictions =
          predictions.filter(
            (p) =>
              p.user_id ===
              user.id
          );

        const totalPoints =
          userPredictions.reduce(
            (sum, p) =>
              sum +
              (p.points || 0),
            0
          );

        const correctPredictions =
          userPredictions.filter(
            (p) =>
              (p.points || 0) > 0
          ).length;

        return {
          ...user,
          totalPoints,
          correctPredictions,
        };
      }
    );

    rows.sort(
      (a, b) =>
        b.totalPoints -
        a.totalPoints
    );

    setRanking(rows);
  }

  function getMedal(
    position: number
  ) {
    if (position === 0)
      return "🥇";

    if (position === 1)
      return "🥈";

    if (position === 2)
      return "🥉";

    return "🏅";
  }

  function logout() {
    localStorage.removeItem(
      "user"
    );

    window.location.href = "/";
  }

  return (
    <div>
      <div
        style={{
          padding: "15px",
          marginBottom: "20px",
          borderBottom:
            "1px solid #ddd",
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
            background:
              "#ef4444",
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
        <h1
          style={{
            textAlign: "center",
            marginBottom:
              "30px",
          }}
        >
          🏆 Classifica Mondiale
          2026
        </h1>

        {ranking.length ===
          0 && (
          <p>
            Nessun dato
            disponibile
          </p>
        )}

        {ranking.map(
          (row, index) => (
            <div
              key={row.id}
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                border:
                  "1px solid #ddd",
                borderRadius:
                  "12px",
                padding:
                  "16px",
                marginBottom:
                  "12px",
                background:
                  index === 0
                    ? "#fff8dc"
                    : "#ffffff",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      "22px",
                    fontWeight:
                      "bold",
                  }}
                >
                  {getMedal(
                    index
                  )}{" "}
                  #
                  {index +
                    1}
                </div>

                <div
                  style={{
                    fontSize:
                      "18px",
                    marginTop:
                      "5px",
                  }}
                >
                  {
                    row.name
                  }
                </div>
              </div>

              <div
                style={{
                  textAlign:
                    "right",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "24px",
                    fontWeight:
                      "bold",
                    color:
                      "#2563eb",
                  }}
                >
                  {
                    row.totalPoints
                  }{" "}
                  pt
                </div>

                <div
                  style={{
                    color:
                      "#666",
                    marginTop:
                      "4px",
                  }}
                >
                  ✅{" "}
                  {
                    row.correctPredictions
                  }{" "}
                  corretti
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}