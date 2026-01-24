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

export interface UserAPICreate {
  first_name: string;
  last_name: string;
  phone: string;
  dob: Date;
  email: string;
  id: string;
  created_at: Date;
  address: Address;
  enabled: null;
  role: string;
  failed_login_attempts: null;
}

export interface CurrentUser {
  id: string;
  provider: null;
  first_name: string;
  last_name: string;
  phone: null;
  dob: Date;
  email: string;
  totp_enabled: boolean;
  created_at: Date;
  address: Address;
}
