import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { syncUser, getMe } from '../services/api';
import { setupInterceptors } from '../services/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setup axios interceptors once
  useEffect(() => {
    setupInterceptors(getToken);
  }, [getToken]);

  const fetchOrSyncUser = useCallback(async () => {
    if (!isSignedIn || !clerkUser) {
      setDbUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Try sync first (creates if new, updates if existing)
      const { data } = await syncUser({
        email: clerkUser.primaryEmailAddress?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        profileImageUrl: clerkUser.imageUrl,
      });
      setDbUser(data.user);
      setError(null);
    } catch (err) {
      // If sync fails, try just fetching
      try {
        const { data } = await getMe();
        setDbUser(data.user);
        setError(null);
      } catch (fetchErr) {
        setError(fetchErr.response?.data?.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    if (isLoaded) fetchOrSyncUser();
  }, [isLoaded, isSignedIn, fetchOrSyncUser]);

  const refreshUser = () => fetchOrSyncUser();

  const isAdmin = dbUser?.role === 'admin';
  const isApproved = dbUser?.status === 'approved';
  const isPending = dbUser?.status === 'pending';

  return (
    <UserContext.Provider value={{ dbUser, loading, error, isAdmin, isApproved, isPending, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useAppUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useAppUser must be used within UserProvider');
  return ctx;
};
