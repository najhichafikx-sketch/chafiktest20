'use client';

import { useState, useEffect } from 'react';

export function useHistory() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const token = localStorage.getItem('supabase_token');
      if (!token) { setLoading(false); return; }
      const res = await fetch('/api/thumbnail-generator/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDesigns(data.designs || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  return { designs, loading, refetch: fetchHistory };
}
