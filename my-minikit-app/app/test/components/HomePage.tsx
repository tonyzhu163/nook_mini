'use client';
import React, { useState, useEffect } from 'react';
import { fetchBaseUsdcYields } from '../utils/fetchYields';
import { Logo } from './Logo';

export function HomePage({ onContinue }: { onContinue: () => void }) {
  const [highestRate, setHighestRate] = useState<number>(10.3); // default fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRates() {
      const yields = await fetchBaseUsdcYields();
      if (yields.length > 0) {
        const highest = Math.max(...yields.map(pool => pool.apy));
        setHighestRate(highest);
      }
      setLoading(false);
    }
    loadRates();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, #f5f5f5 0%, #ffffff 100%)',
      padding: '2rem'
    }}>
      {/* Logo */}
      <Logo marginBottom="3rem" />

      {/* Main Content */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          lineHeight: '1.1',
          marginBottom: '2rem',
          color: '#000'
        }}>
          Higher yield.<br />For everyone.
        </h1>
        
        <div style={{
          fontSize: '1.25rem',
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          Live rate through Nook is
          <span style={{
            color: '#7CFF6B',
            fontWeight: 'bold',
            fontSize: '1.5rem'
          }}>
            ● {loading ? '...' : highestRate.toFixed(1) + '%'}
          </span>
          APY
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        style={{
          background: '#000',
          color: '#fff',
          padding: '1.25rem 8rem',
          borderRadius: '50px',
          border: 'none',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Continue
      </button>
    </div>
  );
}