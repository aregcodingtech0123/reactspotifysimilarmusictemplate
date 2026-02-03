/**
 * Auth module: request/response and domain types.
 */
export interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  accessToken: string;
  expiresIn: string;
}

export interface MeResponse {
  id: string;
  username: string;
  email: string;
}

export interface GoogleAuthBody {
  idToken: string;
}
