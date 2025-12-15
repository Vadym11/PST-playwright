/**
 * Generates a random integer between min (inclusive) and max (inclusive).
 * @param min The minimum possible value.
 * @param max The maximum possible value.
 * @returns A random integer.
 */
export function getRandomIntInclusive(min: number, max: number): number {
    // Ensure inputs are treated as integers for correct range calculation
    const minCeiled: number = Math.ceil(min);
    const maxFloored: number = Math.floor(max);
    
    // The maximum is inclusive and the minimum is inclusive
    // Math.random() generates a number from [0, 1). Multiplying ensures it covers the whole range.
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}
