import { query, toJsonValue } from "./db";

export function normalizeGameSession(session) {
  if (!session) return null;
  return {
    ...session,
    players: session.players || [],
    currentQuestion: session.currentQuestion || null
  };
}

export async function getGameSessionByPin(pin) {
  if (!pin) return null;
  const rows = await query(
    `SELECT gs.id, gs.pin, gs.host_id, gs.title, gs.status, gs.question_count, gs.seconds_per_question,
            gs.current_question_index, gs.created_at, p.display_name AS host_name
     FROM game_sessions gs
     LEFT JOIN profiles p ON p.id = gs.host_id
     WHERE gs.pin = ?
     LIMIT 1`,
    [pin]
  ).catch(() => []);

  const session = rows[0];
  if (!session) return null;

  const players = await query(
    `SELECT id, user_id, display_name, score, joined_at
     FROM game_players
     WHERE session_id = ?
     ORDER BY joined_at ASC`,
    [session.id]
  ).catch(() => []);

  const questionRows = await query(
    `SELECT id, question_index, prompt, glyph, options
     FROM game_questions
     WHERE session_id = ? AND question_index = ?
     LIMIT 1`,
    [session.id, session.current_question_index || 0]
  ).catch(() => []);

  return {
    ...session,
    players,
    currentQuestion: questionRows[0]
      ? {
          ...questionRows[0],
          options: toJsonValue(questionRows[0].options, [])
        }
      : null
  };
}

export async function getGameLeaderboard(pin) {
  const session = await getGameSessionByPin(pin);
  if (!session) return null;
  return {
    ...session,
    players: [...session.players].sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
  };
}
