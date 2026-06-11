'use client';

import { useEffect, useState, useCallback, startTransition } from 'react';
import { AdController } from '@/lib/adSystem';

export function useAdController() {
  const [context, setContext] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ctx = AdController.init();
    startTransition(() => setContext(ctx));
    startTransition(() => setReady(true));
  }, []);

  const canShow = useCallback((adType, overrides) => {
    return AdController.canShowAd(adType, overrides);
  }, [ready]);

  const triggerPopunder = useCallback(() => {
    return AdController.maybeShowPopunder('hook');
  }, [ready]);

  const triggerSocialBar = useCallback(() => {
    return AdController.maybeShowSocialBar();
  }, [ready]);

  const loadBanner = useCallback((container, slot, options) => {
    return AdController.loadBannerInto(container, slot, options);
  }, [ready]);

  const recordClick = useCallback((adType, slot, network) => {
    AdController.recordClick(adType, slot, network);
  }, []);

  return { context, ready, canShow, triggerPopunder, triggerSocialBar, loadBanner, recordClick };
}

export default useAdController;
