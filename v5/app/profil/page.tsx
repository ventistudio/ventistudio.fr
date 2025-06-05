'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

interface Profile {
  username: string;
  avatar_url: string | null;
  role: string;
  bio: string | null;
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: p } = await supabase
          .from('profiles')
          .select('username, avatar_url, role, bio')
          .eq('id', data.user.id)
          .single();
        setProfile(p);
      }
    });
  }, []);

  if (!profile) {
    return <p className="text-center">Veuillez vous connecter.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Profil</h1>
      {profile.avatar_url && (
        <img src={profile.avatar_url} alt="avatar" className="w-24 h-24 rounded-full mb-4" />
      )}
      <p className="text-neonpink text-xl">{profile.username}</p>
      {profile.bio && <p className="mb-2">{profile.bio}</p>}
      <p>Rôle : {profile.role}</p>
    </div>
  );
}
