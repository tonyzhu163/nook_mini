'use client';

import { HomePage } from './components/HomePage';

export default function Page() {
  // Always render the HomePage for the /test route. Navigation to rates is handled by the HomePage continue button.
  return (
    <main style={{ padding: 0, margin: 0 }}>
      <HomePage />
    </main>
  );
}