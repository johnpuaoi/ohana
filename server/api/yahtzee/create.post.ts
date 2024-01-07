import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from '#supabase/server';
import type { YahtzeeGame } from '~/types/custom';
import type { Database } from '~/types/database.types';

type CreateYahtzeeGameRequest = Pick<
  YahtzeeGame,
  'gamemaster' | 'room_name' | 'join_code' | 'private'
>;

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

  const body: CreateYahtzeeGameRequest = await readBody(event);

  // Create the yahtzee game

  const { error, data } = await client
    .from('yahtzee_games')
    .insert({
      gamemaster: body.gamemaster,
      room_name: body.room_name,
      join_code: body.join_code,
      private: body.private,
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
