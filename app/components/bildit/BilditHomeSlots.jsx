'use client';

import {
  SlotPlaceholder,
  StylePlaceholder,
} from '@bildit-platform/hydrogen/client';

/**
 * Home-page BILDIT slots — mirrors the nextjs-example demos:
 * StylePlaceholder, SlotPlaceholder + fallback, forceFallback.
 */
export function BilditHomeSlots() {
  return (
    <section className="bildit-home-slots" style={{marginBottom: '2rem'}}>
      {/* Inject VXE styles for this page into document head */}
      <StylePlaceholder slotId="home-styles" target="head" />
      <StylePlaceholder slotId="global-styles" target="head" />

      <div style={{marginBottom: '1.5rem'}}>
        <h2 style={{fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a', marginBottom: '0.5rem'}}>
          SlotPlaceholder + fallback
        </h2>
        <SlotPlaceholder
          slotId="home-hero"
          className="bildit-slot"
          fallback={
            <div
              style={{
                border: '1px dashed #d4d4d8',
                borderRadius: '4px',
                padding: '1.5rem',
                fontSize: '0.875rem',
                color: '#52525b',
              }}
            >
              No content scheduled for <code>home-hero</code>. This fallback
              renders until you assign a banner in BILDIT.
            </div>
          }
        />
      </div>

      <div style={{marginBottom: '1.5rem'}}>
        <h2 style={{fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a', marginBottom: '0.5rem'}}>
          Additional slots
        </h2>
        <SlotPlaceholder
          slotId="home-promo"
          fallback={
            <p style={{fontSize: '0.875rem', color: '#71717a'}}>
              home-promo empty
            </p>
          }
        />
        <SlotPlaceholder
          slotId="home-next-slot"
          fallback={
            <p style={{fontSize: '0.875rem', color: '#71717a'}}>
              home-next-slot empty
            </p>
          }
        />
      </div>

      <div>
        <h2 style={{fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a', marginBottom: '0.5rem'}}>
          forceFallback example
        </h2>
        <SlotPlaceholder
          slotId="promo-logo"
          forceFallback
          fallback={
            <div style={{fontSize: '0.875rem', fontWeight: 500, color: '#3f3f46'}}>
              Default logo / promo (forceFallback=true)
            </div>
          }
        />
      </div>
    </section>
  );
}
