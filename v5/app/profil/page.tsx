'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  if (!user) {
    return <p className="text-center">Veuillez vous connecter.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Profil</h1>
      <p>Utilisateur : {user.user_metadata?.name || user.email}</p>
    </div>
  );
}
