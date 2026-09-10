export interface StreakTier {
  color: string;
  glow: string;
  nameKey: string;
}

export function getStreakTier(streak: number): StreakTier {
  if (streak >= 100) return { color: "linear-gradient(135deg,#f59e0b,#ef4444,#8b5cf6,#3b82f6)", glow: "0 0 14px rgba(245,158,11,0.6)", nameKey: "streak_tier_legend" };
  if (streak >= 60) return { color: "#06b6d4", glow: "0 0 10px rgba(6,182,212,0.5)", nameKey: "streak_tier_diamond" };
  if (streak >= 30) return { color: "#f59e0b", glow: "0 0 10px rgba(245,158,11,0.5)", nameKey: "streak_tier_gold" };
  if (streak >= 14) return { color: "#8b5cf6", glow: "0 0 8px rgba(139,92,246,0.4)", nameKey: "streak_tier_purple" };
  if (streak >= 7) return { color: "#3b82f6", glow: "0 0 8px rgba(59,130,246,0.4)", nameKey: "streak_tier_blue" };
  return { color: "#f97316", glow: "none", nameKey: "streak_tier_starter" };
}