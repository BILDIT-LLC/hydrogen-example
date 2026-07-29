import {BilditFaqSlots} from '~/components/bildit/BilditFaqSlots';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'FAQ | BILDIT Hydrogen Example'}];
};

export default function Faq() {
  return (
    <div className="faq" style={{padding: '2rem 0', maxWidth: '48rem'}}>
      <h1 style={{fontSize: '1.5rem', marginBottom: '1.5rem'}}>FAQ</h1>
      <BilditFaqSlots />
    </div>
  );
}

/** @typedef {import('./+types/faq').Route} Route */
