'use client';
import React, { useState, useEffect } from 'react';
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
import '../styles/wallet.css'; 

type Pool = typeof EARNING_POOLS[0];

export function RatesPageLive({ onShowDetails }: { onShowDetails: (pool: Pool) => void }) {
  const { address, isConnected } = useAccount();
  const [pools, setPools] = useState<Pool[]>(EARNING_POOLS);
  const [loading, setLoading] = useState(true);
  
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f5f5f5 0%, #ffffff 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Logo */}
        <Logo />

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
            <strong style={{ fontSize: '1.1rem' }}>Your Balances (Base Sepolia)</strong>
            {parseFloat(ethBalance?.formatted ?? '0') > 0 && (
              <div style={{ marginTop: '1rem', fontSize: '0.95rem' }}>
                ETH: <strong>{parseFloat(ethBalance?.formatted ?? '0').toFixed(5)}</strong> {ethBalance?.symbol ?? 'ETH'}
              </div>
            )}
            {parseFloat(usdcBalance?.formatted ?? '0') > 0 && (
              <div style={{ fontSize: '0.95rem' }}>
                USDC: <strong>{parseFloat(usdcBalance?.formatted ?? '0').toFixed(5)}</strong> {usdcBalance?.symbol ?? 'USDC'}
              </div>
            )}
            {parseFloat(wbtcBalance?.formatted ?? '0') > 0 && (
              <div style={{ fontSize: '0.95rem' }}>
                WBTC: <strong>{parseFloat(wbtcBalance?.formatted ?? '0').toFixed(5)}</strong> {wbtcBalance?.symbol ?? 'WBTC'}
              </div>
            )}
            {parseFloat(linkBalance?.formatted ?? '0') > 0 && (
              <div style={{ fontSize: '0.95rem' }}>
                LINK: <strong>{parseFloat(linkBalance?.formatted ?? '0').toFixed(5)}</strong> {linkBalance?.symbol ?? 'LINK'}
              </div>
            )}
            <div style={{ 
              marginTop: '1rem', 
              paddingTop: '1rem', 
              borderTop: '1px solid #f0f0f0',
              fontSize: '1rem'
            }}>
              Total Value: <strong>${totalWalletValue.toFixed(2)}</strong>
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
            {pools.sort((a, b) => b.rate - a.rate).map((pool, index) => (
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
                <span style={{ fontWeight: '500', color: '#000' }}>
                  {pool.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    color: index === 0 ? '#7CFF6B' : '#000',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}>
                    {pool.rate.toFixed(1)}% APY
                  </span>
                  <button 
                    style={{
                      background: 'transparent',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#666'
                    }}
                    onClick={() => onShowDetails(pool)}
                  >
                    Details
                  </button>
                </div>
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
                fontWeight: 'bold',
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
                Based on your current balance of <strong>${totalWalletValue.toFixed(2)}</strong> you could earn <strong>${potentialEarnings.toFixed(2)}</strong> or higher annually by putting your funds to work with Nook.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}