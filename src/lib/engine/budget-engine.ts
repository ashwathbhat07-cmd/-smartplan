import type { Destination, Vibe, OnboardingData } from "@/types";
import { destinations } from "@/lib/data/destinations";

export interface MatchResult {
  destination: Destination;
  score: number;
  breakdown: {
    budgetScore: number;
    vibeScore: number;
    seasonScore: number;
  };
  estimatedTotal: number;
  budgetFit: "perfect" | "comfortable" | "tight" | "over";
}

/**
 * Budget-first destination matching engine.
 * Scores destinations 0-100 based on budget fit, vibe match, and seasonality.
 */
export function findDestinations(preferences: OnboardingData): MatchResult[] {
  const { budget, duration, vibes, startDate, region } = preferences;

  // Filter by region first
  let pool = destinations;
  if (region !== "both") {
    pool = pool.filter((d) => d.region === region);
  }

  // Score and rank each destination
  const results: MatchResult[] = pool
    .map((dest) => {
      const estimatedTotal = dest.avg_daily_cost * duration;
      const budgetScore = calculateBudgetScore(budget, estimatedTotal, dest);
      // Score against all selected vibes, take the best match
      const vibeScore = Math.max(
        ...vibes.map((v) => calculateVibeScore(v, dest.vibes))
      );
      const seasonScore = calculateSeasonScore(startDate, dest.best_months);

      // Weighted total: budget matters most (50%), vibe (30%), season (20%)
      const score = Math.round(
        budgetScore * 0.5 + vibeScore * 0.3 + seasonScore * 0.2
      );

      const budgetFit = getBudgetFit(budget, estimatedTotal);

      return {
        destination: dest,
        score,
        breakdown: { budgetScore, vibeScore, seasonScore },
        estimatedTotal,
        budgetFit,
      };
    })
    // Only show destinations within 150% of budget (filter out impossible ones)
    .filter((r) => r.estimatedTotal <= budget * 1.5)
    .sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Budget score (0-100):
 * - Perfect fit (estimated = 60-90% of budget): 100
 * - Under budget (< 60%): 70-90 (too cheap might mean less quality)
 * - Slightly over (90-110%): 60-80
 * - Over budget (110-150%): 20-50
 */
function calculateBudgetScore(
  budget: number,
  estimatedTotal: number,
  dest: Destination
): number {
  const ratio = estimatedTotal / budget;

  if (ratio <= 0.3) return 60; // Way too cheap, probably not ideal
  if (ratio <= 0.5) return 75;
  if (ratio <= 0.7) return 90;
  if (ratio <= 0.9) return 100; // Sweet spot
  if (ratio <= 1.0) return 95; // Right at budget
  if (ratio <= 1.1) return 75; // Slightly over
  if (ratio <= 1.3) return 50; // Over but doable if they stretch
  return 25; // Way over
}

/**
 * Vibe score (0-100):
 * - Exact vibe match: 100
 * - Has the vibe among others: 80
 * - Related vibes: 40-60
 * - No match: 20
 */
function calculateVibeScore(userVibe: Vibe, destVibes: Vibe[]): number {
  if (destVibes.includes(userVibe)) {
    // Primary vibe match — bonus if it's the first/main vibe
    return destVibes[0] === userVibe ? 100 : 85;
  }

  // Check related vibes
  const vibeRelations: Record<Vibe, Vibe[]> = {
    adventure: ["nature", "offbeat"],
    relaxation: ["nature", "romantic"],
    cultural: ["spiritual", "foodie"],
    romantic: ["relaxation", "nature"],
    party: ["urban", "foodie"],
    nature: ["adventure", "relaxation", "offbeat"],
    spiritual: ["cultural", "nature"],
    foodie: ["cultural", "urban"],
    urban: ["party", "foodie"],
    offbeat: ["adventure", "nature"],
  };

  const related = vibeRelations[userVibe] || [];
  const hasRelated = destVibes.some((v) => related.includes(v));

  if (hasRelated) return 50;
  return 20;
}

/**
 * Season score (0-100):
 * - Travel month is in best_months: 100
 * - Adjacent month: 70
 * - Off-season: 40
 * - No date specified: 70 (neutral)
 */
function calculateSeasonScore(
  startDate: string | null,
  bestMonths: number[]
): number {
  if (!startDate) return 70; // No date = neutral score

  const month = new Date(startDate).getMonth() + 1; // 1-12

  if (bestMonths.includes(month)) return 100;

  // Check adjacent months
  const prevMonth = month === 1 ? 12 : month - 1;
  const nextMonth = month === 12 ? 1 : month + 1;
  if (bestMonths.includes(prevMonth) || bestMonths.includes(nextMonth))
    return 70;

  return 40;
}

/**
 * Human-readable budget fit label
 */
function getBudgetFit(
  budget: number,
  estimatedTotal: number
): "perfect" | "comfortable" | "tight" | "over" {
  const ratio = estimatedTotal / budget;
  if (ratio <= 0.7) return "comfortable";
  if (ratio <= 0.95) return "perfect";
  if (ratio <= 1.1) return "tight";
  return "over";
}

/**
 * Get a single destination by ID
 */
export function getDestinationById(id: string): Destination | undefined {
  return destinations.find((d) => d.id === id);
}

/**
 * Get all unique vibes from destinations
 */
export function getAllVibes(): Vibe[] {
  const vibes = new Set<Vibe>();
  destinations.forEach((d) => d.vibes.forEach((v) => vibes.add(v)));
  return Array.from(vibes);
}

/**
 * Format currency for display
 */
export function formatBudget(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  }
  return `₹${amount}`;
}
