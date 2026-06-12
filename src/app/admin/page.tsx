"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);

  const [homeTeam, setHomeTeam] =
    useState("");

  const [awayTeam, setAwayTeam] =
    useState("");

  const [kickoff, setKickoff] =
    useState("");

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/";
      return;
    }

    const user =
      JSON.parse(storedUser);

    if (!user.is_admin) {
      window.location.href =
        "/matches";
      return;
    }

    loadMatches();
  }, []);

  async function loadMatches() {
    const { data } =
      await supabase
        .from("matches")
        .select("*")
        .order("kickoff");

    setMatches(data || []);
    setLoading(false);
  }

  async function createMatch() {
    if (
      !homeTeam.trim() ||
      !awayTeam.trim() ||
      !kickoff
    ) {
      alert(
        "Compila tutti i campi"
      );
      return;
    }

    const { error } =
      await supabase
        .from("matches")
        .insert({
          home_team: homeTeam,
          away_team: awayTeam,
          kickoff,
        });

    if (error) {
      alert(
        "Errore nella creazione della partita"
      );
      return;
    }

    alert(
      "Partita creata con successo"
    );

    setHomeTeam("");
    setAwayTeam("");
    setKickoff("");

    loadMatches();
  }

  function calculateResult(
    homeScore: number,
    awayScore: number
  ) {
    if (homeScore > awayScore)
      return "1";

    if (homeScore < awayScore)
      return "2";

    return "X";
  }

  async function saveResult(
    match: any
  ) {
    const homeScore = Number(
      match.home_score
    );

    const awayScore = Number(
      match.away_score
    );

    if (
      isNaN(homeScore) ||
      isNaN(awayScore)
    ) {
      alert(
        "Inserisci entrambi i punteggi"
      );
      return;
    }

    const result =
      calculateResult(
        homeScore,
        awayScore
      );

    const { error } =
      await supabase
        .from("matches")
        .update({
          home_score:
            homeScore,
          away_score:
            awayScore,
          result,
        })
        .eq("id", match.id);

    if (error) {
      alert(
        "Errore nel salvataggio del risultato"
      );
      return;
    }

    const {
      data: predictions,
    } = await supabase
      .from("predictions")
      .select("*")
      .eq(
        "match_id",
        match.id
      );

    if (predictions) {
      for (const prediction of predictions) {
        const points =
          prediction.prediction ===
          result
            ? 3
            : 0;

        await supabase
          .from(
            "predictions"
          )
          .update({
            points,
          })
          .eq(
            "id",
            prediction.id
          );
      }
    }

    alert(
      "Risultato salvato e punti aggiornati"
    );

    loadMatches();
  }

  async function deleteMatch(
    matchId: number
  ) {
    const confirmed =
      window.confirm(
        "Sei sicuro di voler eliminare questa partita? Verranno eliminati anche tutti i pronostici collegati."
      );

    if (!confirmed) return;

    const {
      error: predictionsError,
    } = await supabase
      .from("predictions")
      .delete()
      .eq("match_id", matchId);

    if (predictionsError) {
      alert(
        "Errore durante l'eliminazione dei pronostici"
      );
      return;
    }

    const {
      error: matchError,
    } = await supabase
      .from("matches")
      .delete()
      .eq("id", matchId);

    if (matchError) {
      alert(
        "Errore durante l'eliminazione della partita"
      );
      return;
    }

    setMatches((prev) =>
      prev.filter(
        (m) => m.id !== matchId
      )
    );

    alert(
      "Partita eliminata con successo"
    );
  }

  function updateMatch(
    id: number,
    field: string,
    value: string
  ) {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              [field]: value,
            }
          : m
      )
    );
  }

  function logout() {
    localStorage.removeItem(
      "user"
    );

    window.location.href = "/";
  }

  if (loading) {
    return (
      <div
        style={{
          padding: 20,
        }}
      >
        Caricamento...
      </div>
    );
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

        <a href="/admin">
          ⚙️ Admin
        </a>

        <button
          onClick={logout}
          style={{
            marginLeft: "auto",
            padding: "8px 14px",
            border: "none",
            borderRadius:
              "6px",
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
        <h1>
          ⚙️ Gestione Risultati
        </h1>

        <div
          style={{
            border:
              "1px solid #ddd",
            borderRadius:
              "10px",
            padding: "20px",
            marginBottom:
              "30px",
            background:
              "#f9fafb",
          }}
        >
          <h2>
            ➕ Nuova Partita
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "12px",
              marginTop:
                "15px",
            }}
          >
            <input
              type="text"
              placeholder="Squadra Casa"
              value={homeTeam}
              onChange={(e) =>
                setHomeTeam(
                  e.target.value
                )
              }
              style={{
                padding: "10px",
              }}
            />

            <input
              type="text"
              placeholder="Squadra Ospite"
              value={awayTeam}
              onChange={(e) =>
                setAwayTeam(
                  e.target.value
                )
              }
              style={{
                padding: "10px",
              }}
            />

            <input
              type="datetime-local"
              value={kickoff}
              onChange={(e) =>
                setKickoff(
                  e.target.value
                )
              }
              style={{
                padding: "10px",
              }}
            />

            <button
              onClick={
                createMatch
              }
              style={{
                padding:
                  "12px",
                border:
                  "none",
                borderRadius:
                  "6px",
                background:
                  "#16a34a",
                color:
                  "white",
                cursor:
                  "pointer",
                fontWeight:
                  "bold",
              }}
            >
              CREA PARTITA
            </button>
          </div>
        </div>

        {matches.map(
          (match) => (
            <div
              key={match.id}
              style={{
                border:
                  "1px solid #ddd",
                borderRadius:
                  "10px",
                padding:
                  "20px",
                marginBottom:
                  "20px",
                background:
                  "#ffffff",
              }}
            >
              <h3>
                {
                  match.home_team
                }{" "}
                vs{" "}
                {
                  match.away_team
                }
              </h3>

              <p>
                🕒{" "}
                {new Date(
                  match.kickoff
                ).toLocaleString()}
              </p>

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  marginTop:
                    "15px",
                }}
              >
                <input
                  type="number"
                  placeholder="Casa"
                  value={
                    match.home_score ??
                    ""
                  }
                  onChange={(
                    e
                  ) =>
                    updateMatch(
                      match.id,
                      "home_score",
                      e.target
                        .value
                    )
                  }
                  style={{
                    width:
                      "80px",
                    padding:
                      "10px",
                  }}
                />

                <span>
                  -
                </span>

                <input
                  type="number"
                  placeholder="Ospite"
                  value={
                    match.away_score ??
                    ""
                  }
                  onChange={(
                    e
                  ) =>
                    updateMatch(
                      match.id,
                      "away_score",
                      e.target
                        .value
                    )
                  }
                  style={{
                    width:
                      "80px",
                    padding:
                      "10px",
                  }}
                />

                <button
                  onClick={() =>
                    saveResult(
                      match
                    )
                  }
                  style={{
                    padding:
                      "10px 18px",
                    border:
                      "none",
                    borderRadius:
                      "6px",
                    background:
                      "#2563eb",
                    color:
                      "white",
                    cursor:
                      "pointer",
                  }}
                >
                  Salva
                </button>

                <button
                  onClick={() =>
                    deleteMatch(
                      match.id
                    )
                  }
                  style={{
                    padding:
                      "10px 18px",
                    border:
                      "none",
                    borderRadius:
                      "6px",
                    background:
                      "#dc2626",
                    color:
                      "white",
                    cursor:
                      "pointer",
                  }}
                >
                  🗑 Elimina
                </button>
              </div>

              {match.result && (
                <div
                  style={{
                    marginTop:
                      "15px",
                  }}
                >
                  <strong>
                    Risultato:
                  </strong>{" "}
                  {
                    match.result
                  }
                </div>
              )}

              {(match.home_score !==
                null ||
                match.away_score !==
                  null) && (
                <div
                  style={{
                    marginTop:
                      "8px",
                  }}
                >
                  <strong>
                    Score:
                  </strong>{" "}
                  {
                    match.home_score
                  }{" "}
                  -{" "}
                  {
                    match.away_score
                  }
                </div>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}