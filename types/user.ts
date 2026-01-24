export interface User {
  first_name: string;
  last_name: string;
  address: Address;
  dob: string;
  phone: string;
  email: string;
  password: string;
}
export interface Address {
  street: string;
  postal_code: string;
  city: string;
  state: string;
  country: string;
}
