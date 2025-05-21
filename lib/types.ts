export interface Lead {
  id: string
  lead_owner: string
  first_name: string
  last_name: string
  title: string
  email: string
  mobile: string
  lead_source: string
  lead_status: string
  street: string
  city: string
  state: string
  zipcode: string
  country: string
  descri: string
}

export interface User {
  id: number
  full_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}
