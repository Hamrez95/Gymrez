import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../features/auth/useAuth';
import { supabaseClient } from '../../data/supabase/client';
import type { Profile } from '../contracts/profile';
import male from './avatars/athlete-h.webp';
import female from './avatars/athlete-r.webp';

export function ProfileAvatar({ profile, hero = false }: { profile: Profile; hero?: boolean }) {
  const { userId } = useAuth();
  const avatar = useQuery({
    queryKey: ['profile-avatar', userId, profile.householdId, profile.id],
    enabled: Boolean(userId && supabaseClient), staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabaseClient!.storage.from('profile-media').createSignedUrl(`${profile.householdId}/${profile.id}/avatar.webp`, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
  });
  return <img className={hero ? 'pace-avatar pace-avatar--hero' : 'pace-avatar'} src={avatar.data ?? (profile.initial.toUpperCase() === 'R' ? female : male)} alt={'آواتار ورزشی ' + profile.displayName} width={hero ? 640 : 48} height={hero ? 640 : 48} />;
}
