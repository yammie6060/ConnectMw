import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession, SessionUser } from '@/lib/auth';

export function useSession() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/");
      return;
    }
    setUser(session);
    setLoaded(true);
  }, [router]);

  const logout = () => {
    clearSession();
    router.push("/");
  };

  return { user, loaded, logout };
}