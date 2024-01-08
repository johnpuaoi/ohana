import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from '#supabase/server';
import type { Database } from '~/types/database.types';

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
