export function generateMockApyHistory(baseRate: number) {
  const history = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Create realistic variations around the base rate
    const variation = (Math.random() - 0.5) * (baseRate * 0.15);
    const rate = baseRate + variation;
    
    history.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rate: Math.max(0, rate)
    });
  }
  
  return history;
}