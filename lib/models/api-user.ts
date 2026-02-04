export interface BaseUser {
  first_name: string;
  last_name: string;
  phone: string;
  dob: string;
  email: string;
  address: Address;
}
export interface User extends BaseUser {
  password: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface GetAllUsersResponse extends BaseUser {
  provider: null;
  id: string;
  enabled: boolean;
  role: Role;
  failed_login_attempts: number;
  totp_enabled: boolean;
  created_at: string;
}

export enum Role {
  User = 'user',
  Admin = 'admin',
}

export interface RegisterUserResponse extends BaseUser {
  id: string;
  created_at: string;
  enabled: null;
  role: string;
  failed_login_attempts: null;
}

export interface GetCurrentUserResponse extends BaseUser {
  id: string;
  provider: null;
  totp_enabled: boolean;
  created_at: string;
}
