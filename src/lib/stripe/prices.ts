export type PlanKey = 'basic' | 'plus' | 'vip'

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

export const STRIPE_PRICE_IDS: Record<PlanKey, string> = {
  basic: process.env.STRIPE_PRICE_ID_BASIC || 'price_1T20XdGigUIifkMi7JtOKPwH',
  plus: process.env.STRIPE_PRICE_ID_PLUS || 'price_1T20ZTGigUIifkMiosr9BHO9',
  vip: process.env.STRIPE_PRICE_ID_VIP || 'price_1T20bdGigUIifkMiz4SQnIO4',
}

export function isPlanKey(value: unknown): value is PlanKey {
  return value === 'basic' || value === 'plus' || value === 'vip'
}

export function getPriceIdForPlan(plan: PlanKey): string {
  return STRIPE_PRICE_IDS[plan]
}

export function getPlanFromPriceId(priceId: string): PlanKey | null {
  for (const [plan, id] of Object.entries(STRIPE_PRICE_IDS) as Array<[PlanKey, string]>) {
    if (id === priceId) return plan
  }
  return null
}

export function getAppUrlFromEnvOrRequestOrigin(origin: string) {
  return process.env.NEXT_PUBLIC_APP_URL || origin
}

export function getWebhookSecret() {
  return requiredEnv('STRIPE_WEBHOOK_SECRET')
}

