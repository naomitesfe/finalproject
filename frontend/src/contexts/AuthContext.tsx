/// <reference types="vite/client" />
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "entrepreneur" | "investor" | "realtor" | "supplier" | "admin";

export interface Profile {
  _id: string;
  fullName: string;
  firstName: string; // for easy dashboard greeting
  email: string;
  role: Role;
}

interface AuthContextType {
  user: { email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Profile>;
  signUp: (fullName: string, email: string, password: string, role: Role) => Promise<Profile>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedProfile = localStorage.getItem("profile");

    if (token && storedProfile) {
      try {
        const parsed: Profile = JSON.parse(storedProfile);
        setUser({ email: parsed.email });
        setProfile(parsed);
      } catch {
        localStorage.removeItem("profile");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // -------------------------------------------
  // SIGN IN
  // -------------------------------------------
  const signIn = async (email: string, password: string): Promise<Profile> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      const profile: Profile = data.profile;

      setUser({ email: profile.email });
      setProfile(profile);

      localStorage.setItem("token", data.token);
      localStorage.setItem("profile", JSON.stringify(profile));

      return profile;
    } catch (err: any) {
      throw new Error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------
  // SIGN UP
  // -------------------------------------------
  const signUp = async (
    fullName: string,
    email: string,
    password: string,
    role: Role
  ): Promise<Profile> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      const profile: Profile = data.profile;

      setUser({ email: profile.email });
      setProfile(profile);

      localStorage.setItem("token", data.token);
      localStorage.setItem("profile", JSON.stringify(profile));

      return profile;
    } catch (err: any) {
      throw new Error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------
  // SIGN OUT
  // -------------------------------------------
  const signOut = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// -------------------------------------------
// HOOK
// -------------------------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
