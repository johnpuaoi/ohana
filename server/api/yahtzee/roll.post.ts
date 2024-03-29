import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from '#supabase/server';
import { generatePotentialScores } from '~/server/utils/yahtzee/scoring';
import { isUserPlayable } from '~/server/utils/yahtzee/security';
import type { YahtzeeScorecard } from '~/types/custom';
import type { Database } from '~/types/database.types';

interface YahtzeeRollRequest {
  toKeepIndexes: number[];
  gameId: string;
  scorecardId: string;
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

  const body: YahtzeeRollRequest = await readBody(event);

  const isAllowed = await isUserPlayable(body.gameId, event);

  if (!isAllowed) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid Action',
    });
  }

  // Get the scorecard
  const { data: scorecard, error } = await client
    .from('yahtzee_scorecards')
    .select('*')
    .eq('player_id', user.id)
    .eq('game_id', body.gameId)
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  if (!scorecard) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The player does not have a scorecard.',
    });
  }

  if (!hasRollsLeft(scorecard)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This player has no rolls left.',
    });
  }

  // Figure out how many dice were kept by minusing the total possible dice by the amount of dice kept by the player. This gives us the number of dice to generate.
  const diesToRoll = 5 - body.toKeepIndexes.length;

  // Roll the dice
  const rollResult = genDie(diesToRoll);

  const diceToRoll = determineIndexesToUpdate(body.toKeepIndexes);

  // Update the dice
  scorecard.current_dice = updateDice(
    scorecard.current_dice,
    diceToRoll,
    rollResult
  );

  // Generate potential scoring
  const potentialScorecard = generatePotentialScores(scorecard);

  // Update the scorecard in supabase.
  const { error: updateScorecardError } = await client
    .from('yahtzee_scorecards')
    .update({ ...potentialScorecard, roll: increaseRoll(scorecard.roll) })
    .eq('game_id', body.gameId)
    .eq('player_id', user.id);

  if (updateScorecardError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateScorecardError.message,
    });
  }

  return {
    statusCode: 200,
    statusMessage: 'OK',
  };
});

function determineIndexesToUpdate(kept_indexs: number[]): number[] {
  // Possible indexes are 0, 1, 2, 3, 4, 5
  const possibleIndexes = [0, 1, 2, 3, 4, 5];

  // Remove any indexes from possibleIndexes that are in kept_indexes
  return possibleIndexes.filter((index) => !kept_indexs.includes(index));
}

function updateDice(
  current_dice: number[] | null,
  indexes_to_update: number[],
  roll_result: number[]
) {
  if (!current_dice) {
    // Update the whole array
    current_dice = roll_result;

    return current_dice;
  }

  current_dice.map((index) => {
    if (indexes_to_update.includes(index)) return roll_result[index];
  });

  return current_dice;
}

function hasRollsLeft(scorecard: YahtzeeScorecard): boolean {
  if (scorecard.roll === null) {
    return true;
  }

  if (scorecard.roll < 3) {
    return true;
  }

  return false;
}

function increaseRoll(roll: number | null) {
  if (!roll) return 1;

  return roll++;
}
