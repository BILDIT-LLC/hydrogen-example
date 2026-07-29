'use client';

import {
  SlotPlaceholder,
  StylePlaceholder,
} from '@bildit-platform/hydrogen/client';

export function BilditFaqSlots() {
  return (
    <section className="bildit-faq-slots">
      <StylePlaceholder slotId="faq-styles" target="head" />

      <SlotPlaceholder
        slotId="faq"
        fallback={
          <div
            style={{
              border: '1px dashed #d4d4d8',
              borderRadius: '4px',
              padding: '1.5rem',
              fontSize: '0.875rem',
              color: '#52525b',
              marginBottom: '1rem',
            }}
          >
            FAQ fallback — schedule content to the <code>faq</code> slot.
          </div>
        }
      />

      <SlotPlaceholder
        slotId="nursultan"
        fallback={
          <p style={{fontSize: '0.875rem', color: '#71717a'}}>
            No content for <code>nursultan</code>.
          </p>
        }
      />
    </section>
  );
}
