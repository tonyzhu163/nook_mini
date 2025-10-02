import React from 'react';
import { useAccount, useBalance } from 'wagmi';
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import { Identity, Avatar, Name, Address } from '@coinbase/onchainkit/identity';
import { EARNING_POOLS, USDC_SEPOLIA } from '../constants/pools';
import { Logo } from './Logo';

type Pool = typeof EARNING_POOLS[0];

export function RatesPageMock({ onShowDetails }: { onShowDetails: (pool: Pool) => void }) {
  const { address, isConnected } = useAccount();
  
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

  const highestRate = Math.max(...EARNING_POOLS.map(pool => pool.rate));
  
  const ETH_PRICE = 2400;
  
  const totalWalletValue = 
    (parseFloat(usdcBalance?.formatted || '0')) + 
    (parseFloat(ethBalance?.formatted || '0') * ETH_PRICE);

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
            <ConnectWallet className="text-black" />
            <WalletDropdown>
              <Identity
                className="px-4 pt-3 pb-2 hover:bg-blue-200 text-black"
                hasCopyAddressOnClick
              >
                <Avatar />
                <Name className="text-black" />
                <Address className="text-black" />
              </Identity>
              <WalletDropdownDisconnect className="hover:bg-blue-200 text-black" />
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
            <div style={{ marginTop: '1rem', fontSize: '0.95rem' }}>
              ETH: <strong>{parseFloat(ethBalance?.formatted ?? '0').toFixed(5)}</strong> {ethBalance?.symbol ?? 'ETH'}
            </div>
            <div style={{ fontSize: '0.95rem' }}>
              USDC: <strong>{parseFloat(usdcBalance?.formatted ?? '0').toFixed(5)}</strong> {usdcBalance?.symbol ?? 'USDC'}
            </div>
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
            The rates above reflect the 30 day one time 1% APY Bonus
          </p>

          {/* Rates List */}
          <div style={{ marginBottom: '2rem' }}>
            {EARNING_POOLS.sort((a, b) => b.rate - a.rate).map((pool, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 0',
                  borderBottom: index < EARNING_POOLS.length - 1 ? '1px solid #f0f0f0' : 'none'
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