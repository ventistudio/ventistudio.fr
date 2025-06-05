'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function LoginButton() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session) {
    return (
      <button onClick={() => supabase.auth.signOut()} className="hover:text-neonblue transition">Déconnexion</button>
    );
  }
  return (
    <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'discord' })} className="hover:text-neonblue transition">
      Connexion Discord
    </button>
  );
}
