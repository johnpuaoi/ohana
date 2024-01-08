import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from '#supabase/server';
import type { Database } from '~/types/database.types';
import type { H3Event } from 'h3';
import { isAParticipant } from '~/server/utils/yahtzee/security';

interface CreateScoreCardRequest {
  gameId: string;
}

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole<Database>(event);

  const user = await serverSupabaseUser(event);

  // If no user return unauthorized
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'unauthorized',
    });
  }

  const body: CreateScoreCardRequest = await readBody(event);

  // Get the game
  const { error: currentGameError, data: currentGame } = await client
    .from('yahtzee_games')
    .select('*')
    .eq('id', body.gameId)
    .single();

  if (currentGameError) {
    throw createError({
      statusCode: 500,
      statusMessage: currentGameError.message,
    });
  }

  // Ensure that the game has not started
  if (currentGame.has_started) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'The game has already started and no scorecards can be given.',
    });
  }

  // Ensure that the player is a participant
  if (!isAParticipant(currentGame, user.id)) {
    throw createError({
      statusCode: 401,
      statusMessage:
        'Unauthorized: This player is not a participant of this game.',
    });
  }

  // Check if player already has a scorecard for this game
  const { error: duplicateError, data: duplicateScorecard } = await client
    .from('yahtzee_scorecards')
    .select('*')
    .eq('game_id', body.gameId)
    .eq('player_id', user.id)
    .single();

  if (duplicateError) {
    throw createError({
      statusCode: 500,
      statusMessage: duplicateError.message,
    });
  }

  if (duplicateScorecard) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Player already has a scorecard for this game.',
    });
  }

  const { error, data } = await client
    .from('yahtzee_scorecards')
    .insert({
      player_id: user.id,
      game_id: body.gameId,
    })
    .select('id')
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return data.id;
});
