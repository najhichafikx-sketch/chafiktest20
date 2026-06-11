'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';

const API = '/api/platforms/lab';

function getUserId() {
  if (typeof window === 'undefined') return null;
  let uid = localStorage.getItem('pv_user_id');
  if (!uid) {
    uid = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    localStorage.setItem('pv_user_id', uid);
  }
  return uid;
}

export function useLabPoints() {
  const [labPoints, setLabPoints] = useState(0);
  const [labSessions, setLabSessions] = useState(0);
  const [labEarned, setLabEarned] = useState(0);
  const [labSpent, setLabSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const refetch = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const initRes = await fetch(API + '/init', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
      const initData = await initRes.json();
      setLabPoints(initData.lab_points || 0);
      setLabSessions(initData.lab_sessions || 0);
      setLabEarned(initData.lab_earned || 0);
      setLabSpent(initData.lab_spent || 0);
      if (initData.offline) setOffline(true);
    } catch { setOffline(true); }
    setLoading(false);
  }, []);

  useEffect(() => { startTransition(() => refetch()); }, [refetch]);

  const earn = useCallback(async (amount) => {
    const userId = getUserId();
    const res = await fetch(API + '/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action: 'earn', amount }) });
    const data = await res.json();
    if (data.lab_points !== undefined) setLabPoints(data.lab_points);
    if (data.lab_earned !== undefined) setLabEarned(data.lab_earned);
    return data;
  }, []);

  const purchase = useCallback(async (screens) => {
    const userId = getUserId();
    const res = await fetch(API + '/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action: 'purchase', amount: screens }) });
    const data = await res.json();
    if (data.lab_points !== undefined) setLabPoints(data.lab_points);
    if (data.lab_sessions !== undefined) setLabSessions(data.lab_sessions);
    if (data.lab_spent !== undefined) setLabSpent(data.lab_spent);
    return data;
  }, []);

  const runTest = useCallback(async () => {
    const userId = getUserId();
    const res = await fetch(API + '/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action: 'run' }) });
    const data = await res.json();
    if (data.lab_sessions !== undefined) setLabSessions(data.lab_sessions);
    return data;
  }, []);

  const consume = useCallback(async (count) => {
    const userId = getUserId();
    const res = await fetch(API + '/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action: 'consume', amount: count }) });
    const data = await res.json();
    if (data.lab_sessions !== undefined) setLabSessions(data.lab_sessions);
    return data;
  }, []);

  return { labPoints, labSessions, labEarned, labSpent, loading, offline, refetch, earn, purchase, consume, runTest, getUserId };
}
