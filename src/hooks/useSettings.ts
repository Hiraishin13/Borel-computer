'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  TAX_RATE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
  EXPRESS_SHIPPING_SURCHARGE,
  ASSEMBLY_FEE,
  CURRENCY,
} from '@/lib/constants'

export interface PublicSettings {
  shopName: string
  contactEmail: string
  whatsappNumber: string
  announcement: string
  currency: string
  taxRate: number
  freeShippingThreshold: number
  standardShipping: number
  expressSurcharge: number
  assemblyFee: number
}

const FALLBACK: PublicSettings = {
  shopName: 'Borel Computer',
  contactEmail: 'contact@borelcomputer.com',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
  announcement: '',
  currency: CURRENCY,
  taxRate: TAX_RATE,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  standardShipping: STANDARD_SHIPPING,
  expressSurcharge: EXPRESS_SHIPPING_SURCHARGE,
  assemblyFee: ASSEMBLY_FEE,
}

export function useSettings(): PublicSettings {
  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await apiClient.get<PublicSettings>('/settings')).data,
    staleTime: 5 * 60_000,
  })
  return data ?? FALLBACK
}
