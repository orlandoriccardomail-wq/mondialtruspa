import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// FIFA World Cup
const WORLD_CUP_ID = 2000;

export async function GET() {
  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${WORLD_CUP_ID}/matches`,
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY!,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Football API error: ${response.status}`);
    }

    const data = await response.json();

    for (const match of data.matches) {
      const homeScore = match.score?.fullTime?.home;
      const awayScore = match.score?.fullTime?.away;

      let result: string | null = null;

      if (
        homeScore !== null &&
        homeScore !== undefined &&
        awayScore !== null &&
        awayScore !== undefined
      ) {
        if (homeScore > awayScore) result = "1";
        else if (homeScore < awayScore) result = "2";
        else result = "X";
      }

      await supabase
        .from("matches")
        .upsert(
          
          {
            api_match_id: match.id,
            home_team: match.homeTeam?.name,
            away_team: match.awayTeam?.name,
            kickoff: match.utcDate,
            home_score: homeScore,
            away_score: awayScore,
            result,
          },
          {
            onConflict: "api_match_id",
          }
        );
        if (result) {
  const { data: savedMatch } =
    await supabase
      .from("matches")
      .select("id")
      .eq(
        "api_match_id",
        match.id
      )
      .single();

  if (savedMatch) {
    const {
      data: predictions,
    } = await supabase
      .from("predictions")
      .select("*")
      .eq(
        "match_id",
        savedMatch.id
      );

    if (predictions) {
      for (const prediction of predictions) {
        const points =
          prediction.prediction ===
          result
            ? 1
            : 0;

        await supabase
          .from("predictions")
          .update({
            points,
          })
          .eq(
            "id",
            prediction.id
          );
      }
    }
  }
}
    }

    return NextResponse.json({
      success: true,
      imported: data.matches.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}