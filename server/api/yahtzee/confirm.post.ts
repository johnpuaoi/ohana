import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from '#supabase/server';
import { isUserPlayable } from '~/server/utils/yahtzee/security';
import { YahtzeeGame, YahtzeeScorecard } from '~/types/custom';
import type { Database } from '~/types/database.types';

interface ConfirmScoreSelectionRequest {
  gameId: string;
  selectedScore:
    | 'ones'
    | 'twos'
    | 'threes'
    | 'fours'
    | 'fives'
    | 'sixes'
    | 'threeOfAKind'
    | 'fourOfAKind'
    | 'fullHouse'
    | 'smallStraight'
    | 'largeStraight'
    | 'yahtzee'
    | 'chance';
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

  const body: ConfirmScoreSelectionRequest = await readBody(event);

  const isAllowed = await isUserPlayable(body.gameId, event);

  if (!isAllowed) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid Action',
    });
  }

  // Get the game
  const { error, data: currentGame } = await client
    .from('yahtzee_games')
    .select('*')
    .eq('id', body.gameId)
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  // Get the players scorecard
  const { error: scorecardError, data: scorecard } = await client
    .from('yahtzee_scorecards')
    .select('*')
    .eq('game_id', body.gameId)
    .eq('player_id', user.id)
    .single();

  if (scorecardError) {
    throw createError({
      statusCode: 500,
      statusMessage: scorecardError.message,
    });
  }

  // For the selected score, set the score on the card

  switch (body.selectedScore) {
    case 'ones':
      scorecard.ones = scorecard.ones_potential;
      break;
    case 'twos':
      scorecard.twos = scorecard.twos_potential;
      break;
    case 'threes':
      scorecard.threes = scorecard.threes_potential;
      break;
    case 'fours':
      scorecard.fours = scorecard.fours_potential;
      break;
    case 'fives':
      scorecard.fives = scorecard.fives_potential;
      break;
    case 'sixes':
      scorecard.sixes = scorecard.sixes_potential;
      break;
    case 'threeOfAKind':
      scorecard.three_kind = scorecard.three_kind_potential;
      break;
    case 'fourOfAKind':
      scorecard.four_kind = scorecard.four_kind_potential;
      break;
    case 'fullHouse':
      scorecard.full_house = scorecard.full_house_potential;
      break;
    case 'smallStraight':
      scorecard.small_straight = scorecard.small_straight_potential;
      break;
    case 'largeStraight':
      scorecard.large_straight = scorecard.large_straight_potential;
      break;
    case 'yahtzee':
      scorecard.yahtzee = scorecard.yahtzee_potential;
      break;
    case 'chance':
      scorecard.chance = scorecard.chance_potential;
      break;
    default:
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid selectedScore',
      }); // Add a default case to handle invalid scores
  }

  // Set all potential scores to null
  scorecard.ones_potential = null;
  scorecard.twos_potential = null;
  scorecard.threes_potential = null;
  scorecard.fours_potential = null;
  scorecard.fives_potential = null;
  scorecard.sixes_potential = null;
  scorecard.three_kind_potential = null;
  scorecard.four_kind_potential = null;
  scorecard.full_house_potential = null;
  scorecard.small_straight_potential = null;
  scorecard.large_straight_potential = null;
  scorecard.yahtzee_potential = null;
  scorecard.chance_potential = null;

  // Check if the bonus was met, if so set the bonus score (35pts)
  if (has_met_bonus(scorecard) && scorecard.bonus === null) {
    scorecard.bonus = 35;
  }

  // update scorecard
  const { error: updateScorecardError } = await client
    .from('yahtzee_scorecards')
    .update(scorecard)
    .eq('game_id', body.gameId)
    .eq('player_id', user.id);

  if (updateScorecardError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateScorecardError.message,
    });
  }

  // Check if player is last in the players list and has all scores, this means the game has ended
  if (
    isLastPlayer(currentGame, user.id) &&
    hasAllRequiredScoresFilled(scorecard)
  ) {
    // Get all scorecards
    const { error: allScorecardsError, data: scorecards } = await client
      .from('yahtzee_scorecards')
      .select('*')
      .eq('game_id', body.gameId);

    if (allScorecardsError) {
      throw createError({
        statusCode: 500,
        statusMessage: allScorecardsError.message,
      });
    }

    if (!scorecards) {
      throw createError({
        statusCode: 400,
        statusMessage: 'There are no scorecords for this game.',
      });
    }

    const winner = getWinner(scorecards);

    // update the game
    const { error: gameError } = await client.from('yahtzee_games').update({
      has_ended: true,
      winner,
    });

    if (gameError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'There was an error',
      });
    }

    // TODO: update player shushers

    return {
      statusCode: 200,
      statusMessage: 'The game has ended.',
    };
  }

  // Set the next player turn
  const { error: nextPlayerError } = await client
    .from('yahtzee_games')
    .update({
      current_player: getNextPlayer(currentGame, user.id),
    })
    .eq('id', body.gameId);

  if (nextPlayerError) {
    throw createError({
      statusCode: 500,
      statusMessage: nextPlayerError.message,
    });
  }

  return {
    statusCode: 200,
    statusMessage: 'OK',
  };
});

function has_met_bonus(scorecard: YahtzeeScorecard) {
  const upperSectionTotal = calculateUpperSectionTotal(scorecard);
  return upperSectionTotal >= 63;
}

function calculateUpperSectionTotal(scorecard: YahtzeeScorecard) {
  const upperSectionScores = [
    scorecard.ones || 0,
    scorecard.twos || 0,
    scorecard.threes || 0,
    scorecard.fours || 0,
    scorecard.fives || 0,
    scorecard.sixes || 0,
  ];
  return upperSectionScores.reduce((sum, score) => sum + score, 0);
}

function isLastPlayer(current_game: YahtzeeGame, player_id: string): boolean {
  const players = current_game.players!;

  const lastPlayer = players.at(-1);

  if (player_id === lastPlayer) {
    return true;
  }

  return false;
}

function getNextPlayer(
  current_game: YahtzeeGame,
  current_player_id: string
): string {
  const players = current_game.players!;

  // Find the index of the current player
  const currentIndex = players.findIndex(
    (player) => player === current_player_id
  );

  // Calculate the index of the next player, wrapping around to the beginning if needed
  const nextIndex = (currentIndex + 1) % players.length;

  // Return the ID of the next player
  return players[nextIndex];
}

// Checks if all 13 required scores are filled
function hasAllRequiredScoresFilled(scorecard: YahtzeeScorecard): boolean {
  return (
    scorecard.ones !== null &&
    scorecard.twos !== null &&
    scorecard.threes !== null &&
    scorecard.fours !== null &&
    scorecard.fives !== null &&
    scorecard.sixes !== null &&
    scorecard.three_kind !== null &&
    scorecard.four_kind !== null &&
    scorecard.full_house !== null &&
    scorecard.small_straight !== null &&
    scorecard.large_straight !== null &&
    scorecard.yahtzee !== null &&
    scorecard.chance !== null
  );
}

function calculateTotalScore(scorecard: YahtzeeScorecard): number {
  const upperSectionScores = [
    scorecard.ones || 0,
    scorecard.twos || 0,
    scorecard.threes || 0,
    scorecard.fours || 0,
    scorecard.fives || 0,
    scorecard.sixes || 0,
  ];

  const upperSectionTotal = upperSectionScores.reduce(
    (sum, score) => sum + score,
    0
  );

  const lowerSectionScores = [
    scorecard.three_kind || 0,
    scorecard.four_kind || 0,
    scorecard.full_house || 0,
    scorecard.small_straight || 0,
    scorecard.large_straight || 0,
    scorecard.yahtzee || 0,
    scorecard.chance || 0,
  ];

  const lowerSectionTotal = lowerSectionScores.reduce(
    (sum, score) => sum + score,
    0
  );

  const bonus = scorecard.bonus || 0;

  return upperSectionTotal + lowerSectionTotal + bonus;
}

function getWinner(scorecards: YahtzeeScorecard[]): string {
  const winner = scorecards.reduce(
    (highestScoreCard, currentScoreCard) => {
      const highestScore = calculateTotalScore(highestScoreCard);
      const currentScore = calculateTotalScore(currentScoreCard);

      return highestScore >= currentScore ? highestScoreCard : currentScoreCard;
    },
    scorecards[0] // Start with the first scorecard
  );

  return winner.player_id;
}
