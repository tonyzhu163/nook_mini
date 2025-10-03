 'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchBaseUsdcYields } from '../utils/fetchYields';
import { Logo } from './Logo';

export function HomePage({ onContinue }: { onContinue?: () => void }) {
  const router = useRouter();
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
      {/* Fixed logo positioned at the page top-left to match other pages */}
      <div style={{ position: 'fixed', left: '2rem', top: '2rem', zIndex: 50 }}>
        <Logo />
      </div>

      {/* Main Content */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        maxWidth: '600px'
      }}>
        <h1 style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          color: '#000',
          lineHeight: '1.05',
          fontWeight: 700
        }}>
          {/* First line: never wrap, responsive size */}
          <span style={{
            fontSize: 'clamp(2.2rem, 9.5vw, 4rem)',
            whiteSpace: 'nowrap',
            display: 'block'
          }}>Higher yield.</span>

          {/* Second line: forced to next row, same font size */}
          <span style={{
            fontSize: 'clamp(2.2rem, 9.5vw, 4rem)',
            marginTop: '0.25rem'
          }}>For everyone.</span>
        </h1>
        
        <div style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.25rem)',
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ marginRight: '0.4rem' }}>Live rate through Nook is</span>
          <span style={{
            color: '#7CFF6B',
            fontWeight: '700',
            fontSize: 'clamp(1.1rem, 4.5vw, 1.5rem)',
            display: 'inline-block',
            minWidth: '3ch',
            textAlign: 'right'
          }}>
            ● {loading ? '...' : new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(highestRate) + '%'}
          </span>
          <span style={{ marginLeft: '0.4rem' }}>APY</span>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => {
          if (onContinue) return onContinue();
          // default: navigate to /test/rates
          router.push('/test/rates');
        }}
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