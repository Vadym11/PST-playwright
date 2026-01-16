export interface User {
  first_name: string;
  last_name: string;
  address: {
    street: string;
    postal_code: string;
    city: string;
    state: string;
    country: string;
  };
  dob: string;
  phone: string;
  email: string;
  password: string;
}
