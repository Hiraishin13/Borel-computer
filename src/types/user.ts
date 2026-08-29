export type UserRole = 'user' | 'admin'
export type AddressType = 'shipping' | 'billing'

export interface Address {
  id: string
  type: AddressType
  street: string
  city: string
  postalCode: string
  country: string
  default: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  profileImage?: string
  role: UserRole
  addresses: Address[]
  wishlist: string[]
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  id: string
  email: string
  firstName: string
  role: UserRole
  token: string
}
