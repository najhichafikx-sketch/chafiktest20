'use client';

import { useEffect, useRef } from 'react';
import { firePopunderMonetag, canFirePopunder, markPopunderFired } from '@/lib/ads';

export default function AdClickTrigger({ children, as: As = 'button', className, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClick = () => {
      if (canFirePopunder()) {
        firePopunderMonetag();
        markPopunderFired();
      }
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, []);

  return (
    <As ref={ref} className={className} {...rest}>
      {children}
    </As>
  );
}
