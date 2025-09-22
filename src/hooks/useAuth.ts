import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getCurrentProfile } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { profile, error } = await getCurrentProfile();
      if (error && error.message?.includes('Cannot coerce the result to a single JSON object')) {
        // Profile doesn't exist, create a basic one
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              role: 'customer',
              contact_type: 'primary'
            });
          
          if (!insertError) {
            // Reload the profile after creating it
            const { profile: newProfile } = await getCurrentProfile();
            setProfile(newProfile);
          } else {
            console.error('Error creating profile:', insertError);
          }
        }
      } else if (error) {
        console.error('Error loading profile:', error);
      } else {
        setProfile(profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isSalesAdmin: profile?.role === 'sales_admin' || profile?.role === 'admin',
    refetch: () => user && loadProfile(user.id),
  };
}