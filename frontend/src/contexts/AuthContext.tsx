import { createContext, useContext, useEffect, useState, ReactNode } from 'react'; 

interface Profile {
  _id: string;
  fullName: string;
  email: string;
  role: 'entrepreneur' | 'investor' | 'realtor' | 'supplier' | 'admin';
}

interface AuthContextType {
  user: { email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = (import.meta as any).env?.VITE_API_URL || ''; // backend URL from .env

  // Load user from localStorage on mount
  useEffect(() => {
    // Commented real API/localStorage loading
    // const token = localStorage.getItem('token');
    // const storedProfile = localStorage.getItem('profile');
    // if (token && storedProfile) {
    //   setUser({ email: JSON.parse(storedProfile).email });
    //   setProfile(JSON.parse(storedProfile));
    // }

    // MOCK USER: bypass authorization
    const mockUser = { email: 'testuser@example.com' };
    const mockProfile: Profile = { _id: '123', fullName: 'Test User', email: 'testuser@example.com', role: 'entrepreneur' };
    setUser(mockUser);
    setProfile(mockProfile);

    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Commented real API call
      // const res = await fetch(`${API_URL}/api/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message || 'Login failed');
      // setUser({ email: data.user.email });
      // setProfile(data.profile);
      // localStorage.setItem('token', data.token);
      // localStorage.setItem('profile', JSON.stringify(data.profile));

      // MOCK
      setUser({ email });
      setProfile({ _id: '123', fullName: 'Test User', email, role: 'entrepreneur' });
    } catch (err: any) {
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    setLoading(true);
    try {
      // Commented real API call
      // const res = await fetch(`${API_URL}/api/auth/signup`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, fullName, role }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message || 'Signup failed');
      // setUser({ email: data.user.email });
      // setProfile(data.profile);
      // localStorage.setItem('token', data.token);
      // localStorage.setItem('profile', JSON.stringify(data.profile));

      // MOCK
      setUser({ email });
      setProfile({ _id: '123', fullName, email, role: role as Profile['role'] });
    } catch (err: any) {
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setProfile(null);
    // localStorage.removeItem('token');
    // localStorage.removeItem('profile');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
