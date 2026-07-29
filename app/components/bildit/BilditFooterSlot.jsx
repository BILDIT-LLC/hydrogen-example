'use client';

import {SlotPlaceholder} from '@bildit-platform/hydrogen/client';

export function BilditFooterSlot() {
  return (
    <SlotPlaceholder
      slotId="layout-footer"
      fallback={
        <p style={{fontSize: '0.875rem', color: '#71717a', margin: '1rem 0'}}>
          Footer fallback — assign content to the <code>layout-footer</code>{' '}
          slot in BILDIT.
        </p>
      }
    />
  );
}
