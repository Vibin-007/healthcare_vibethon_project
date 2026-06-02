import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface AuthContextType {
  session: any;
  profile: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, profile: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Helper function with .limit(1) to prevent 406 errors
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
      return data;
    };

    async function initializeAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (mounted) {
        setSession(session);
        if (session) {
          const data = await fetchProfile(session.user.id);
          setProfile(data);
        }
        setLoading(false);
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        if (newSession) {
          const data = await fetchProfile(newSession.user.id);
          setProfile(data);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); 

  return (
    <AuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);