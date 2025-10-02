'use client';

import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { RatesPageMock } from './components/RatesPageMock';
import { RatesPageLive } from './components/RatesPageLive';
import { ProtocolDetailsPage } from './components/ProtocolDetailsPage';
import { EARNING_POOLS } from './constants/pools';

type Pool = typeof EARNING_POOLS[0];

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'rates' | 'details'>('home');
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  // const [useLiveData, setUseLiveData] = useState(false);
  const [useLiveData] = useState(true); // Default to live data

  const handleShowDetails = (pool: Pool) => {
    setSelectedPool(pool);
    setCurrentPage('details');
  };

  // const toggleDataSource = () => {
  //   console.log('Toggling from', useLiveData, 'to', !useLiveData);
  //   setUseLiveData(!useLiveData);
  // };

  // console.log('Current useLiveData:', useLiveData);

  return (
    <main style={{ padding: 0, margin: 0 }}>
      {/* Toggle button
      {currentPage === 'rates' && (
        <div style={{ 
          position: 'fixed', 
          top: '1rem', 
          right: '1rem', 
          zIndex: 100 
        }}>
          <button
            onClick={toggleDataSource}
            style={{
              background: useLiveData ? '#7CFF6B' : '#666',
              color: useLiveData ? '#000' : '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {useLiveData ? 'Live Data ✓' : 'Mock Data'}
          </button>
        </div>
      )} */}

      {currentPage === 'home' && (
        <HomePage onContinue={() => setCurrentPage('rates')} />
      )}
      
      {/* {currentPage === 'rates' && !useLiveData && (
        <RatesPageMock onShowDetails={handleShowDetails} />
      )} */}
      
      {currentPage === 'rates' && useLiveData && (
        <RatesPageLive onShowDetails={handleShowDetails} />
      )}
      
      {currentPage === 'details' && selectedPool && (
        <ProtocolDetailsPage 
          pool={selectedPool} 
          onBack={() => setCurrentPage('rates')} 
        />
      )}
    </main>
  );
}