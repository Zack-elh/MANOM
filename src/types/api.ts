// === Auth ===

export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'client' | 'admin'
  phone?: string | null
  created_at?: string
}

export interface LoginResponse {
  message: string
  token: string
  user: AuthUser
}

export interface SignupResponse {
  message: string
  user: AuthUser & { role: 'client' }
}

export interface MeResponse {
  user: AuthUser
}

export interface LogoutResponse {
  message: string
}

export interface ForgotPasswordResponse {
  message: string
  expires_in?: number
}

export interface ResetPasswordResponse {
  message: string
}

// === Public ===

export interface ApiService {
  id: number
  title: string
  description: string | null
  duration: number
  price: number
}

export interface ApiBarber {
  id: number
  name: string
  specialty: string | null
  image: string | null
}

export interface PublicServicesResponse {
  services: ApiService[]
}

export interface PublicBarbersResponse {
  barbers: ApiBarber[]
}

// === Bookings ===

export interface Booking {
  id: number
  ref_code: string
  service_title: string
  barber_name: string
  booking_date: string
  booking_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  price: number
  duration?: number
  notes?: string | null
  specialty?: string
  can_cancel?: boolean
  hours_until?: number
  created_at?: string
}

export interface BookingSlot {
  time: string
  datetime: string
}

export interface SlotsResponse {
  date?: string
  barber_id?: number
  duration?: number
  slots: BookingSlot[]
  message?: string
}

export interface CreateBookingResponse {
  message: string
  booking: {
    id: number
    ref_code: string
    service: string
    barber_id: number
    booking_date: string
    booking_time: string
    status: string
    duration: number
    price: number
  }
}

export interface CancelBookingResponse {
  message: string
  booking: {
    id: number
    ref_code: string
    status: string
    service: string
    booking_date: string
    booking_time: string
  }
}

export interface MyBookingsResponse {
  bookings: Booking[]
  total: number
}

// === Admin ===

export interface AdminService {
  id: number
  title: string
  description: string | null
  duration: number
  price: number
  active: number | boolean
}

export interface AdminBarber {
  id: number
  name: string
  specialty: string | null
  image: string | null
  active: number | boolean
}

export interface AdminClient {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
  created_at: string
  total_bookings: number
  active_bookings: number
}

export interface AdminBooking {
  id: number
  ref_code: string
  service_title: string
  barber_name: string
  client_name: string
  client_email: string
  client_phone?: string | null
  booking_date: string
  booking_time: string
  status: string
  price: number
  duration?: number
  notes?: string | null
  created_at?: string
}

export interface AdminStats {
  today: { bookings: number; revenue: number }
  month: { bookings: number; revenue: number }
  pending_bookings: number
  total_clients: number
  upcoming: Array<{
    id: number
    ref_code: string
    booking_date: string
    booking_time: string
    status: string
    service_title: string
    price: number
    barber_name: string
    client_name: string
    client_email?: string
  }>
  recent: Array<{
    id: number
    ref_code: string
    booking_date: string
    booking_time: string
    status: string
    created_at: string
    service_title: string
    price: number
    barber_name: string
    client_name: string
  }>
}

export interface AdminServicesResponse {
  services: AdminService[]
}

export interface AdminBarbersResponse {
  barbers: AdminBarber[]
}

export interface AdminBookingsResponse {
  bookings: AdminBooking[]
  total: number
}

export interface AdminClientsResponse {
  clients: AdminClient[]
  total: number
}

export interface AdminCreateResponse {
  message: string
  id?: number
  booking?: { id: number; ref_code: string }
}

export interface AdminUpdateResponse {
  message: string
}

export interface AdminDeleteResponse {
  message: string
}

// === Error ===

export interface ApiError {
  error: string
  hours_until?: number
  cancel_window?: number
}

// === Currency ===

export type Currency = 'USD' | 'EUR' | 'MAD'
