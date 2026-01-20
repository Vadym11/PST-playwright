// import { PaginatedResponse } from './api-responses';

// export interface Users {
//     current_page: number;
//     data:         User[];
//     from:         number;
//     last_page:    number;
//     per_page:     number;
//     to:           number;
//     total:        number;
// }

export interface UserAPI {
  id: string;
  provider: null;
  first_name: string;
  last_name: string;
  phone: string;
  dob: string;
  email: string;
  totp_enabled: boolean;
  created_at: string;
  address: Address;
  enabled: boolean;
  role: Role;
  failed_login_attempts: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export enum Role {
  User = 'user',
  Admin = 'admin',
}
