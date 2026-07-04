// lib/plans.ts

export const PLANS = {
  free: {
    name: "Free",
    limit: 500 * 1024 * 1024, // 500 Mo en octets
  },
  essentiel: {
    name: "Essentiel",
    limit: 50 * 1024 * 1024 * 1024, // 50 Go
  },
  pro: {
    name: "Pro",
    limit: 250 * 1024 * 1024 * 1024, // 250 Go
  },
  studio: {
    name: "Studio",
    limit: 1024 * 1024 * 1024 * 1024, // 1 To
  },
};

export type PlanType = keyof typeof PLANS;

export const getPlanLimit = (planName: string = "free") => {
  const key = planName.toLowerCase() as PlanType;
  return PLANS[key]?.limit || PLANS.free.limit;
};
