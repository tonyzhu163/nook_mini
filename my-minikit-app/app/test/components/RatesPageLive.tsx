'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useBalance } from 'wagmi';
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import { Identity, Avatar, Name, Address } from '@coinbase/onchainkit/identity';
import { EARNING_POOLS, USDC_SEPOLIA, WBTC_SEPOLIA, LINK_SEPOLIA} from '../constants/pools';
import { fetchBaseUsdcYields } from '../utils/fetchYields';
import { Logo } from './Logo';
import { PageHeader } from './PageHeader';
import '../styles/wallet.css'; 

type Pool = typeof EARNING_POOLS[0];

export function RatesPageLive({ onShowDetails }: { onShowDetails: (pool: Pool) => void }) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [pools, setPools] = useState<Pool[]>(EARNING_POOLS);
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  
  useEffect(() => {
    async function loadYields() {
      const yields = await fetchBaseUsdcYields();
      if (yields.length > 0) {
        const mappedPools = yields.map(y => ({
          name: y.name,
          protocol: y.protocol,
          rate: y.apy,
          poolId: y.poolId  // Add this line
        }));
        setPools(mappedPools);
      }
      setLoading(false);
    }
    loadYields();
  }, []);

  // Swipe handling: swipe left to go back
  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - (touchStartX.current ?? 0);
    const dy = t.clientY - (touchStartY.current ?? 0);
    // require mostly horizontal swipe, threshold 75px, and swipe left (dx < -75)
    if (Math.abs(dy) < 75 && dx < -75) {
      // navigate back in history on swipe left
      router.back();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }
  
  // ETH balance
  const { data: ethBalance } = useBalance({
    address,
    chainId: 84532,
  });
  
  // USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_SEPOLIA.address,
    chainId: 84532,
  });

  // WBTC balance (only if address filled)
  const { data: wbtcBalance } = useBalance({
    address,
    token: WBTC_SEPOLIA.address || undefined,
    chainId: 84532,
  });

  // LINK balance (only if address filled)
  const { data: linkBalance } = useBalance({
    address,
    token: LINK_SEPOLIA.address || undefined,
    chainId: 84532,
  });

  // live prices
  const [ethUsd, setEthUsd] = useState<number | null>(null);
  const [btcUsd, setBtcUsd] = useState<number | null>(null);
  const [linkUsd, setLinkUsd] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const [ethRes, btcRes, linkRes] = await Promise.all([
          fetch('https://api.coinbase.com/v2/exchange-rates?currency=ETH'),
          fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC'),
          fetch('https://api.coinbase.com/v2/exchange-rates?currency=LINK')
        ]);
        const ethData = await ethRes.json();
        const btcData = await btcRes.json();
        const linkData = await linkRes.json();
        setEthUsd(parseFloat(ethData.data.rates.USD));
        setBtcUsd(parseFloat(btcData.data.rates.USD));
        // Some Coinbase instances may not support LINK directly; fallback to NaN guard
        setLinkUsd(linkData?.data?.rates?.USD ? parseFloat(linkData.data.rates.USD) : null);
      } catch (e) {
        console.error('Error fetching fiat rates:', e);
      }
    }
    fetchPrices();
  }, []);

  const highestRate = Math.max(...pools.map(pool => pool.rate));
  
  // compute total wallet USD value from balances and live prices
  const ethUsdPrice = ethUsd ?? 4400; // fallback to fixed
  const btcUsdPrice = btcUsd ?? 120000;
  const linkUsdPrice = linkUsd ?? 23;

  const totalWalletValue =
    (parseFloat(usdcBalance?.formatted || '0')) +
    (parseFloat(ethBalance?.formatted || '0') * ethUsdPrice) +
    (parseFloat(wbtcBalance?.formatted || '0') * btcUsdPrice) +
    (parseFloat(linkBalance?.formatted || '0') * linkUsdPrice);

  const potentialEarnings = (totalWalletValue * highestRate) / 100;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f5f5f5 0%, #ffffff 100%)',
        padding: '2rem'
      }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
  <PageHeader showBack backLabel="Back to Home" onBack={() => router.push('/test')} />

        {/* Wallet Connect */}
        <div style={{ marginBottom: '2rem' }}>
          <Wallet>
            <ConnectWallet className="text-black" disconnectedLabel='Log In'/>
            <WalletDropdown>
              <WalletDropdownDisconnect className="hover:bg-white-200 text-black" />
            </WalletDropdown>
          </Wallet>
        </div>

        {/* Balance Display Section */}
        {isConnected && (
          <div
            style={{
              marginTop: '1rem',
              marginBottom: '2rem',
              padding: '1.5rem',
              background: '#fff',
              color: '#000',
              borderRadius: '20px',
              boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0'
            }}
          >
            <div style={{ color: '#000', fontSize: '0.95rem', marginBottom: '0.5rem', fontWeight: 600 }}>Your Balances</div>
            {parseFloat(ethBalance?.formatted ?? '0') > 0 && (
              <div style={{ marginTop: '1rem', fontSize: '0.95rem' }}>
                <span style={{ color: '#6b7280' }}>ETH:</span> <span style={{ color: '#000' }}>{parseFloat(ethBalance?.formatted ?? '0').toFixed(5)}</span> <span style={{ color: '#6b7280' }}>{ethBalance?.symbol ?? 'ETH'}</span>
              </div>
            )}
            {parseFloat(usdcBalance?.formatted ?? '0') > 0 && (
              <div style={{ fontSize: '0.95rem' }}>
                <span style={{ color: '#6b7280' }}>USDC:</span> <span style={{ color: '#000' }}>{parseFloat(usdcBalance?.formatted ?? '0').toFixed(5)}</span> <span style={{ color: '#6b7280' }}>{usdcBalance?.symbol ?? 'USDC'}</span>
              </div>
            )}
            {parseFloat(wbtcBalance?.formatted ?? '0') > 0 && (
              <div style={{ fontSize: '0.95rem' }}>
                <span style={{ color: '#6b7280' }}>WBTC:</span> <span style={{ color: '#000' }}>{parseFloat(wbtcBalance?.formatted ?? '0').toFixed(5)}</span> <span style={{ color: '#6b7280' }}>{wbtcBalance?.symbol ?? 'WBTC'}</span>
              </div>
            )}
            {parseFloat(linkBalance?.formatted ?? '0') > 0 && (
              <div style={{ fontSize: '0.95rem' }}>
                <span style={{ color: '#6b7280' }}>LINK:</span> <span style={{ color: '#000' }}>{parseFloat(linkBalance?.formatted ?? '0').toFixed(5)}</span> <span style={{ color: '#6b7280' }}>{linkBalance?.symbol ?? 'LINK'}</span>
              </div>
            )}
            <div style={{ 
              marginTop: '1rem', 
              paddingTop: '1rem', 
              borderTop: '1px solid #f0f0f0',
              fontSize: '1rem'
            }}>
              Total Value: <strong style={{ fontWeight: 600 }}>${totalWalletValue.toFixed(2)}</strong>
            </div>
          </div>
        )}

        {/* Current Rates Section */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#000'
          }}>
            Current rates
          </h2>
          <p style={{
            color: '#666',
            fontSize: '0.95rem',
            marginBottom: '2rem'
          }}>
            {loading ? 'Loading live rates from DeFiLlama...' : 'The rate below do not reflect the 30 day one time 1% APY Bonus'}
          </p>

          {/* Rates List */}
          <div style={{ marginBottom: '2rem' }}>
            {/**
             * Sort pools with a fixed priority for certain pool names so they
             * always show first in the specified order. For pools not in the
             * priority list, fall back to sorting by rate (desc).
             * Use a non-mutating sort ([...pools]) to avoid changing state.
             */}
            {[...pools].sort((a, b) => {
              const priorityOrder = [
                'moonwell',
                'aave',
                'seamless morpho',
                'moonwell morpho',
                'spark morpho'
              ];

              const nameA = (a.name || '').toLowerCase().trim();
              const nameB = (b.name || '').toLowerCase().trim();

              const idxA = priorityOrder.indexOf(nameA);
              const idxB = priorityOrder.indexOf(nameB);

              const rankA = idxA === -1 ? Number.MAX_SAFE_INTEGER : idxA;
              const rankB = idxB === -1 ? Number.MAX_SAFE_INTEGER : idxB;

              if (rankA !== rankB) return rankA - rankB;

              // same rank (both not in priority or same priority) -> sort by rate desc
              return b.rate - a.rate;
            }).map((pool, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 0',
                  borderBottom: index < pools.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, marginRight: '56px' }}>
                  {/* Avatar / icon */}
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    background: index === 0 ? '#7CFF6B' : '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: '0 0 36px'
                  }} aria-hidden>
                    {/* simple initial letter as placeholder */}
                    <span style={{ color: index === 0 ? '#002200' : '#9ca3af', fontWeight: 700 }}>
                      {pool.name.split(' ')[0][0] ?? 'P'}
                    </span>
                  </div>

                  {/* Text stack: split title and APY into separate elements, increase font sizes by ~15% */}
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {/* Title (≈15% larger: 0.75rem → 0.86rem) */}
                    <div title={pool.name} style={{
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      color: '#000',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{pool.name}</div>

                    {/* APY row (≈15% larger: 0.72rem → 0.83rem) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      marginTop: '0.25rem'
                    }}>
                      {index === 0 && (
                        <>
                          <span style={{ color: '#7CFF6B', fontWeight: 400, flex: '0 0 auto', fontSize: '0.75rem', lineHeight: 1 }}>Active</span>
                          <span aria-hidden style={{ color: '#9ca3af', fontSize: '0.6rem', lineHeight: 1, margin: '0 0.25rem' }}>•</span>
                        </>
                      )}

                      <div style={{ color: '#6b7280', fontSize: '0.75rem', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                        <span>Current APY is</span>
                        <span style={{ color: '#6b7280', fontWeight: 400 }}>{new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(pool.rate))}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right chevron button */}
                <button
                  onClick={() => {
                    const name = encodeURIComponent(pool.name);
                    const protocol = encodeURIComponent(pool.protocol ?? '');
                    const rate = encodeURIComponent(String(pool.rate));
                    const pid = encodeURIComponent((pool as any).poolId ?? '');
                    router.push(`/test/details?name=${name}&protocol=${protocol}&rate=${rate}&poolId=${pid}`);
                  }}
                  aria-label="Open details"
                  style={{
                    width: 36,
                    height: 36,
                    minWidth: 36,
                    minHeight: 36,
                    padding: 0,
                    borderRadius: 18,
                    background: '#ffffff',
                    border: '1px solid #f0f0f0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <span style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1, display: 'inline-block' }}>›</span>
                </button>
              </div>
            ))}
          </div>

          {/* Earn Section */}
          {isConnected && (
            <div style={{
              background: '#fafafa',
              border: '1px solid #e0e0e0',
              borderRadius: '16px',
              padding: '2rem',
              marginTop: '2rem'
            }}>
              <div style={{
                color: '#666',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}>
                Earn
              </div>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: 600,
                color: '#000',
                marginBottom: '1rem'
              }}>
                ${potentialEarnings.toFixed(2)}
              </div>
              <div style={{
                color: '#666',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                Based on your current balance of <strong style={{ fontWeight: 600 }}>${totalWalletValue.toFixed(2)}</strong> you could earn ${potentialEarnings.toFixed(2)} or higher annually by putting your funds to work with Nook.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}