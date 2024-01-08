import type { YahtzeeScorecard } from '~/types/custom';

export function generateOnes(current_dice: number[]): number {
  // Gather all ones and add them up
  let score: number = 0;

  current_dice.forEach((dice) => {
    if (dice === 1) score += 1;
  });

  return score;
}

export function generateTwos(current_dice: number[]): number {
  let score: number = 0;
  current_dice.forEach((dice) => {
    if (dice === 2) score += 2;
  });
  return score;
}

export function generateThrees(current_dice: number[]): number {
  let score: number = 0;
  current_dice.forEach((dice) => {
    if (dice === 3) score += 3;
  });
  return score;
}

export function generateFours(current_dice: number[]): number {
  let score: number = 0;
  current_dice.forEach((dice) => {
    if (dice === 4) score += 4;
  });
  return score;
}

export function generateFives(current_dice: number[]): number {
  let score: number = 0;
  current_dice.forEach((dice) => {
    if (dice === 5) score += 5;
  });
  return score;
}

export function generateSixes(current_dice: number[]): number {
  let score: number = 0;
  current_dice.forEach((dice) => {
    if (dice === 6) score += 6;
  });
  return score;
}

export function generateThreeOfAKind(current_dice: number[]): number {
  // Check for at least three dice with the same value
  const counts: { [key: number]: number } = {}; // Object with numeric keys
  current_dice.forEach((val) => {
    counts[val] = (counts[val] || 0) + 1; // Store counts directly
  });
  return Object.values(counts).some((count) => count >= 3)
    ? current_dice.reduce((sum, val) => sum + val, 0)
    : 0;
}

export function generateFourOfAKind(current_dice: number[]): number {
  // Check for at least four dice with the same value
  const counts: { [key: number]: number } = {}; // Object with numeric keys
  current_dice.forEach((val) => {
    counts[val] = (counts[val] || 0) + 1; // Store counts directly
  });

  // Find the value with at least four occurrences
  const fourOfAKindValue = Object.entries(counts).find(
    ([value, count]) => count >= 4
  );

  // If found, return the sum of all dice
  if (fourOfAKindValue) {
    return current_dice.reduce((sum, val) => sum + val, 0);
  }

  // Else, return 0
  return 0;
}

export function generateFullHouse(current_dice: number[]): number {
  // Count occurrences of each value
  const counts: { [key: number]: number } = {};
  current_dice.forEach((val) => {
    counts[val] = (counts[val] || 0) + 1;
  });

  // Check for three of one number and two of another
  const sortedCounts = Object.values(counts).sort((a, b) => b - a); // Sort counts descending
  return sortedCounts.length === 2 &&
    sortedCounts[0] === 3 &&
    sortedCounts[1] === 2
    ? 25
    : 0;
}

export function generateSmallStraight(current_dice: number[]): number {
  const sorted = current_dice.sort((a, b) => a - b);
  return (sorted[0] === 1 && sorted[4] === 4) ||
    (sorted[0] === 2 && sorted[4] === 5) ||
    (sorted[0] === 3 && sorted[4] === 6)
    ? 30
    : 0;
}

export function generateLargeStraight(current_dice: number[]): number {
  const sorted = current_dice.sort((a, b) => a - b);
  return (sorted[0] === 1 && sorted[4] === 5) ||
    (sorted[0] === 2 && sorted[4] === 6)
    ? 40
    : 0;
}

export function generateYahtzee(current_dice: number[]): number {
  // Use object to count occurrences
  const counts: { [key: number]: number } = {};
  current_dice.forEach((val) => {
    counts[val] = (counts[val] || 0) + 1;
  });

  // Check if any value has 5 occurrences
  return Object.values(counts).some((count) => count === 5) ? 50 : 0;
}

export function generateChance(current_dice: number[]): number {
  return current_dice.reduce((sum, val) => sum + val, 0);
}

export function generatePotentialScores(
  scorecard: YahtzeeScorecard
): YahtzeeScorecard {
  // Ensure current_dice is present
  if (!scorecard.current_dice) {
    throw new Error('current_dice is required for potential score generation');
  }

  // Calculate potential scores for each category
  scorecard.ones_potential = generateOnes(scorecard.current_dice);
  scorecard.twos_potential = generateTwos(scorecard.current_dice);
  scorecard.threes_potential = generateThrees(scorecard.current_dice);
  scorecard.fours_potential = generateFours(scorecard.current_dice);
  scorecard.fives_potential = generateFives(scorecard.current_dice);
  scorecard.sixes_potential = generateSixes(scorecard.current_dice);
  scorecard.three_kind_potential = generateThreeOfAKind(scorecard.current_dice);
  scorecard.four_kind_potential = generateFourOfAKind(scorecard.current_dice);
  scorecard.full_house_potential = generateFullHouse(scorecard.current_dice);
  scorecard.small_straight_potential = generateSmallStraight(
    scorecard.current_dice
  );
  scorecard.large_straight_potential = generateLargeStraight(
    scorecard.current_dice
  );
  scorecard.yahtzee_potential = generateYahtzee(scorecard.current_dice);
  scorecard.chance_potential = generateChance(scorecard.current_dice);

  // Calculate potential upper section bonus
  const upperTotal =
    (scorecard.ones || 0) +
    (scorecard.twos || 0) +
    (scorecard.threes || 0) +
    (scorecard.fours || 0) +
    (scorecard.fives || 0) +
    (scorecard.sixes || 0);
  scorecard.bonus_potential = upperTotal >= 63 ? 35 : null;

  return scorecard;
}
