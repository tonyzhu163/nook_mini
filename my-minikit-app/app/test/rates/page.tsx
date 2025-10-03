'use client';

import { RatesPageLive } from '../components/RatesPageLive';
import { EARNING_POOLS } from '../constants/pools';

type Pool = typeof EARNING_POOLS[0];

export default function RatesRoute() {
  // Keep API consistent with previous usage: RatesPageLive expects an onShowDetails handler.
  const handleShowDetails = (pool: Pool) => {
    console.log('show details for', pool);
    // Basic placeholder: in-app details navigation can be implemented later.
  };

  return (
    <main style={{ padding: 0, margin: 0 }}>
      <RatesPageLive onShowDetails={handleShowDetails} />
    </main>
  );
}
