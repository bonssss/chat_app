import { Redirect } from 'expo-router';
import { supabase } from '../lib/supabase';
import {  useState } from 'react';
import { useEffect } from 'react';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return authenticated ? <Redirect href="/(tabs)/Home/home" /> : <Redirect href="/onboarding/onbording" />;
}