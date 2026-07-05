export const PLANS = {
  free: {
    name: "Free",
    price: "0€",
    limit: 500 * 1024 * 1024, // 500 Mo
    features: [
      "500 Mo de stockage",
      "Partage de morceaux",
      "Historique des versions (3 dernières)",
    ],
  },
  essentiel: {
    name: "Essentiel",
    price: "4.99€",
    limit: 50 * 1024 * 1024 * 1024, // 50 Go,
    features: [
      "50 Go de stockage",
      "Toutes les fonctionnalités du plan Free",
      "Historique des versions illimité",
    ],
  },
  pro: {
    name: "Pro",
    price: "9.99€",
    limit: 250 * 1024 * 1024 * 1024, // 250 Go,
    features: [
      "250 Go de stockage",
      "Toutes les fonctionnalités du plan Essentiel",
      "Support prioritaire",
    ],
  },
  studio: {
    name: "Studio",
    price: "19.99€",
    limit: 1024 * 1024 * 1024 * 1024, // 1 To,
    features: [
      "1 To de stockage",
      "Toutes les fonctionnalités du plan Pro",
      "Collaboration en temps réel (bientôt)",
    ],
  },
};

export type PlanType = keyof typeof PLANS;

export const getPlanLimit = (plan: PlanType | string | undefined) => {
  const safePlan = (plan && plan in PLANS) ? plan as PlanType : 'free';
  return PLANS[safePlan].limit;
};
