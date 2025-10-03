import React from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from './Logo';

export function PageHeader({
  showBack = false,
  backLabel = 'Back',
  onBack,
}: {
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
}) {
  const router = useRouter();

  function handleBack() {
    if (onBack) return onBack();
    // Use router.back() to navigate to previous page; no longer force home
    router.back();
  }

  return (
    <header style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', justifyContent: 'flex-start', marginBottom: '1rem' }}>
      {/* Logo top-left */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Logo />
      </div>

      {/* Back button below logo */}
      {showBack && (
        <button
          onClick={handleBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#666',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← {backLabel}
        </button>
      )}
    </header>
  );
}
