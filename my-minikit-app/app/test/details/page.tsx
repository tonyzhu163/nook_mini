'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EARNING_POOLS } from '../constants/pools';
import { ProtocolDetailsPage } from '../components/ProtocolDetailsPage';

type Pool = typeof EARNING_POOLS[0];

export default function DetailsRoute() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get('name');
  const protocol = searchParams.get('protocol');
  const rate = searchParams.get('rate');
  const poolId = searchParams.get('poolId');

  let pool: Pool | undefined;
  if (name) {
    // construct pool from query params (rates may come from live fetch)
    pool = {
      name,
      protocol: protocol || 'Unknown',
      rate: rate ? parseFloat(rate) : 0,
      poolId: poolId || ''
    } as Pool;
  }

  // fallback to known pools
  if (!pool) {
    pool = EARNING_POOLS.find(p => p.poolId === poolId || p.name === name) as Pool | undefined;
  }

  if (!pool) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Pool not found.</p>
        <button onClick={() => router.push('/test/rates')}>Back to rates</button>
      </div>
    );
  }

  return (
    <ProtocolDetailsPage 
      pool={pool as Pool}
      onBack={() => router.push('/test/rates')}
    />
  );
}
