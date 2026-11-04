export interface GoogleLoginReturnType {
  token: string;
  email: string;
}

export interface GoogleLoginArgs {
  googleToken: string;
  token: string;
}
