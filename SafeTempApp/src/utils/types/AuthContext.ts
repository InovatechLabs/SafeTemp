import { SignInResult } from "../../../services/auth";

export interface AuthContextProps {
  userToken: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  finalizeLogin: (token: string) => void;
  isGuest: boolean;     
  enterAsGuest: () => void;
}