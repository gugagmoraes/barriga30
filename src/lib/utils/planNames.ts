export type InternalPlanKey = 'basic' | 'plus' | 'vip' | string;

export const getDisplayPlanName = (internalPlan: InternalPlanKey | null | undefined): string => {
  if (!internalPlan) return 'Plano Essencial';
  
  switch (internalPlan) {
    case 'basic':
      return 'Plano Essencial';
    case 'plus':
      return 'Plano Evolução';
    case 'vip':
      return 'Plano Premium';
    default:
      // Fallback for unexpected values
      return 'Plano Essencial';
  }
};
