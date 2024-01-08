import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from '#supabase/server';

import type { H3Event } from 'h3';
import { YahtzeeGame } from '~/types/custom';
import type { Database } from '~/types/database.types';

export async function isUserPlayable(
  game_id: string,
  event: H3Event
): Promise<boolean> {
  const client = serverSupabaseServiceRole<Database>(event);

  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'unauthorized',
    });
  }

  // Get the game
  const { error, data: currentGame } = await client
    .from('yahtzee_games')
    .select('*')
    .eq('id', game_id)
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  const isParticipant = isAParticipant(currentGame, user.id);

  const isPlayable = isGamePlayable(currentGame);

  const isTurn = isUsersTurn(currentGame, user.id);

  // Check that all three are true
  if (isParticipant && isPlayable && isTurn) {
    return true;
  }

  return false;
}

export function isAParticipant(
  current_game: YahtzeeGame,
  player_id: string
): boolean {
  if (!current_game.players) {
    return false;
  }

  // Check if the users id is in the games players key
  return current_game.players.includes(player_id);
}

export function isGamePlayable(current_game: YahtzeeGame): boolean {
  if (current_game.has_started && !current_game.has_ended) {
    return true;
  }

  return false;
}

export function isUsersTurn(
  current_game: YahtzeeGame,
  player_id: string
): boolean {
  if (current_game.current_player === player_id) {
    return true;
  }

  return false;
}
