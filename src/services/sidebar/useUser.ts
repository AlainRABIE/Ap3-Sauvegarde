import { useState, useEffect } from 'react';

interface User {
  email: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include',
        });
        console.log('Requête envoyée à /api/user:', response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: User = await response.json();
        setUser(data);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error.message);
          setError(error.message);
        } else {
          console.error('Erreur inconnue lors de la récupération des données utilisateur:', error);
          setError('Erreur inconnue');
        }
      }
    };

    fetchUser();
  }, []);

  return { user, error };
};
