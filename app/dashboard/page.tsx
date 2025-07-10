'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.email}!</p>
            </div>
            <button
              onClick={logout}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
          
          <div className="mt-8 bg-card shadow rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">User Information</h2>
            <div className="space-y-2">
              <p className="text-foreground"><strong>Email:</strong> {user.email}</p>
              <p className="text-foreground"><strong>Role:</strong> {user.role}</p>
              <p className="text-foreground"><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              <p className="text-foreground"><strong>Updated:</strong> {new Date(user.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}