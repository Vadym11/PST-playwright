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
