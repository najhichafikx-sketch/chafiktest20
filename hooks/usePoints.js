'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePoints() {
  const [points, setPoints] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoints();
  }, []);

  async function fetchPoints() {
    try {
      const token = localStorage.getItem('supabase_token');
      if (!token) { setLoading(false); return; }
      const res = await fetch('/api/user/points', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points);
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  const deductPoints = useCallback(async (amount) => {
    const token = localStorage.getItem('supabase_token');
    if (!token) return false;
    const res = await fetch('/api/user/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ deduct: amount }),
    });
    if (res.ok) {
      setPoints((p) => p - amount);
      return true;
    }
    return false;
  }, []);

  return { points, loading, deductPoints, refetch: fetchPoints };
}
