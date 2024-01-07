/** Generates 5 random numbers between 1 - 6 that represents a die */
export function genDie(amount_of_die: number): number[] {
  const dieRolls = [];

  // Utilize Math.random() for generating random numbers:
  for (let i = 0; i < amount_of_die; i++) {
    const randomNumber = Math.floor(Math.random() * 6) + 1; // Generate values between 1 and 6
    dieRolls.push(randomNumber);
  }

  return dieRolls;
}

console.log(genDie(5));
