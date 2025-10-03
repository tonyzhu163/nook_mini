'use client';
import React, { useState, useEffect } from 'react';
import { EARNING_POOLS } from '../constants/pools';
import { generateMockApyHistory } from '../utils/mockData';
import { fetchHistoricalApy } from '../utils/fetchYields';
import { Logo } from './Logo';
import { PageHeader } from './PageHeader';

type Pool = typeof EARNING_POOLS[0];

export function ProtocolDetailsPage({ 
  pool, 
  onBack 
}: { 
  pool: Pool; 
  onBack: () => void;
}) {
  // Use the display name provided on the pool (set in fetchBaseUsdcYields)
  // so text sections match the card names (e.g. 'Seamless Morpho').
  const [apyHistory, setApyHistory] = useState(generateMockApyHistory(pool.rate));
  const [loading, setLoading] = useState(true);
  
  // Fetch real historical data
  useEffect(() => {
    async function loadHistoricalData() {
      if (pool.poolId) {
        console.log('Loading historical data for pool:', pool.poolId);
        const historical = await fetchHistoricalApy(pool.poolId);
        if (historical.length > 0) {
          setApyHistory(historical);
        } else {
          console.log('No historical data found, using mock data');
        }
      }
      setLoading(false);
    }
    loadHistoricalData();
  }, [pool.poolId]);
  
  const maxRate = React.useMemo(() => Math.max(...apyHistory.map(d => d.rate)), [apyHistory]);
  const minRate = React.useMemo(() => Math.min(...apyHistory.map(d => d.rate)), [apyHistory]);
  const avgRate = React.useMemo(() => apyHistory.reduce((sum, d) => sum + d.rate, 0) / apyHistory.length, [apyHistory]);
  
  const [hoveredPoint, setHoveredPoint] = React.useState<{ index: number; x: number; y: number } | null>(null);

  // 30-day volatility: standard deviation of the APY series (expressed in percentage points)
  const volatilityPct = React.useMemo(() => {
    if (!apyHistory || apyHistory.length < 2) return 0;
    const values = apyHistory.map(d => d.rate || 0);
    const n = values.length;
    const mean = values.reduce((s, v) => s + v, 0) / n;
    // sample standard deviation (divide by n-1)
    const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (n - 1 || 1);
    const std = Math.sqrt(variance);
    return std; // already in percentage points (e.g. 1.23 means 1.23%)
  }, [apyHistory]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f5f5f5 0%, #ffffff 100%)',
      padding: '2rem'
    }}>
  <div className="protocol-details" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Back Button */}
        <PageHeader showBack backLabel="Back to Rates" onBack={onBack} />

        {/* PageHeader above replaces older back button and logo */}

        {/* Protocol Header */}
        <div className="protocol-header" style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#000'
          }}>
            {pool.name}
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <span style={{ color: '#666' }}>Current APY:</span>
            <span style={{
              color: '#7CFF6B',
              fontWeight: 'bold',
              fontSize: '2rem'
            }}>
              {pool.rate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid" style={{
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
          }}>
            <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              30-Day Average
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000' }}>
              {avgRate.toFixed(2)}%
            </div>
          </div>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
          }}>
            <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              30-Day High
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7CFF6B' }}>
              {maxRate.toFixed(2)}%
            </div>
          </div>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
          }}>
            <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              30-Day Low
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000' }}>
              {minRate.toFixed(2)}%
            </div>
          </div>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
          }}>
            <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              30-Day Volatility
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000' }}>
              {/* volatilityPct is computed below */}
              {((typeof volatilityPct !== 'undefined') ? volatilityPct.toFixed(2) : '0.00')}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            color: '#000'
          }}>
            30-Day APY History {loading && '(Loading...)'}
          </h2>
          
          {/* Simple SVG Chart */}
          <div style={{ position: 'relative', height: '300px', width: '100%' }}>
            {/* Floating tooltip */}
            {hoveredPoint !== null && (
              <div style={{
                position: 'absolute',
                left: `${(hoveredPoint.x / 800) * 100}%`,
                top: `${(hoveredPoint.y / 300) * 100}%`,
                transform: 'translate(-50%, -120%)',
                background: 'rgba(128, 128, 128, 0.5)',
                color: '#fff',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
                zIndex: 10,
                whiteSpace: 'nowrap',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)'
              }}>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: '#fff' }}>
                  {apyHistory[hoveredPoint.index].date}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#7CFF6B' }}>
                  {apyHistory[hoveredPoint.index].rate.toFixed(2)}% APY
                </div>
              </div>
            )}
            
            <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              {/* Y-axis labels */}
              <text x="5" y="20" fill="#666" fontSize="12" style={{ transform: 'scale(1, 1)' }}>
                {maxRate.toFixed(1)}%
              </text>
              <text x="5" y="160" fill="#666" fontSize="12" style={{ transform: 'scale(1, 1)' }}>
                {avgRate.toFixed(1)}%
              </text>
              <text x="5" y="290" fill="#666" fontSize="12" style={{ transform: 'scale(1, 1)' }}>
                {minRate.toFixed(1)}%
              </text>
              
              {/* Grid lines */}
              <line x1="60" y1="20" x2="800" y2="20" stroke="#f0f0f0" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <line x1="60" y1="150" x2="800" y2="150" stroke="#f0f0f0" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <line x1="60" y1="280" x2="800" y2="280" stroke="#f0f0f0" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              
              {/* Area fill */}
              <path
                d={`
                  M 60,280
                  ${apyHistory.map((point, i) => {
                    const x = 60 + (i / (apyHistory.length - 1)) * 740;
                    const y = 280 - ((point.rate - minRate) / (maxRate - minRate)) * 260;
                    return `L ${x},${y}`;
                  }).join(' ')}
                  L 800,280
                  Z
                `}
                fill="rgba(124, 255, 107, 0.15)"
              />
              
              {/* Line chart - all points */}
              <path
                d={`
                  M ${60},${280 - ((apyHistory[0].rate - minRate) / (maxRate - minRate)) * 260}
                  ${apyHistory.slice(1).map((point, i) => {
                    const x = 60 + ((i + 1) / (apyHistory.length - 1)) * 740;
                    const y = 280 - ((point.rate - minRate) / (maxRate - minRate)) * 260;
                    return `L ${x},${y}`;
                  }).join(' ')}
                `}
                fill="none"
                stroke="#7CFF6B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* Data points - show all */}
              {apyHistory.map((point, i) => {
                const x = 60 + (i / (apyHistory.length - 1)) * 740;
                const y = 280 - ((point.rate - minRate) / (maxRate - minRate)) * 260;
                return (
                  <g key={i}>
                    {/* Invisible larger hitbox for easier hovering */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="12"
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredPoint({ index: i, x, y })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* Visible data point */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={hoveredPoint?.index === i ? "6" : "3"}
                      fill="#7CFF6B"
                      vectorEffect="non-scaling-stroke"
                      style={{ 
                        pointerEvents: 'none',
                        transition: 'r 0.2s'
                      }}
                    />
                  </g>
                );
              })}
            </svg>
            
            {/* X-axis labels */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '1rem',
              paddingLeft: '60px',
              fontSize: '0.85rem',
              color: '#666'
            }}>
              <span>{apyHistory[0].date}</span>
              <span>{apyHistory[Math.floor(apyHistory.length / 2)].date}</span>
              <span>{apyHistory[apyHistory.length - 1].date}</span>
            </div>
          </div>
        </div>

        {/* Protocol Info */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          marginTop: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#000'
          }}>
            About {pool.name}
          </h3>
          <p style={{
            color: '#666',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            {pool.name} is a decentralized lending protocol that allows users to earn interest on their crypto assets. 
            The APY varies based on supply and demand dynamics within the protocol.
          </p>
          <p style={{
            color: '#666',
            lineHeight: '1.6'
          }}>
            Rates are updated continuously based on market conditions. Historical performance is not indicative of future results.
          </p>
        </div>
      </div>
    </div>
  );
}