export interface YieldPool {
  name: string;
  protocol: string;
  apy: number;
  tvlUsd: number;
  poolId: string;  // Add this line
}

export interface HistoricalApyData {
  date: string;
  rate: number;
}

export async function fetchHistoricalApy(poolId: string): Promise<HistoricalApyData[]> {
  try {
    console.log(`Fetching historical data for pool: ${poolId}`);
    const response = await fetch(`https://yields.llama.fi/chart/${poolId}`);
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.log('No historical data available');
      return [];
    }
    
    // Get last 30 days of data
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const historicalData = data.data
      .filter((point: any) => {
        const timestamp = new Date(point.timestamp).getTime();
        return timestamp >= thirtyDaysAgo;
      })
      .map((point: any) => ({
        date: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        // prefer apy, fall back to apyBase if needed
        rate: parseFloat(((point.apy ?? point.apyBase) || 0).toFixed(2))
      }));
    
    console.log(`Retrieved ${historicalData.length} historical data points`);
    return historicalData;
  } catch (error) {
    console.error('Error fetching historical APY:', error);
    return [];
  }
}

// We'll specifically look for Aave and Moonwell USDC pools on Base and map
// certain USDC token symbols to the requested display names.
const SPECIAL_SYMBOL_MAP: Record<string, { display: string; protocol?: string }> = {
  // symbol keys normalized to lowercase and alphanumeric
  'smusdc': { display: 'Seamless Morpho', protocol: 'seamless-morpho' },
  'sparkusdc': { display: 'Spark Morpho', protocol: 'spark-morpho' },
  'mwusdc': { display: 'Moonwell Morpho', protocol: 'moonwell-morpho' }
};

const TARGET_PROJECT_KEYWORDS = ['aave', 'moonwell'];

// Normalize certain project names to canonical display names
const PROJECT_NAME_OVERRIDES: Record<string, string> = {
  // normalized keys: remove non-alphanumerics and lowercase
  'moonwelllending': 'Moonwell',
  'moonwell': 'Moonwell',
  'aavev3': 'Aave',
  'aave': 'Aave'
};

function titleCase(s: string) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export async function fetchBaseUsdcYields(): Promise<YieldPool[]> {
  try {
    console.log('Fetching DeFiLlama data...');
    const response = await fetch('https://yields.llama.fi/pools');
    const data = await response.json();

    console.log('Total pools received:', data.data?.length);

    // Filter for Base chain first
    const basePools = (data.data || []).filter((pool: any) => pool.chain === 'Base');
    console.log('Base chain pools:', basePools.length);

    // Helper to normalize symbol/project strings
    const normalize = (s: any) => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

    // Filter for USDC pools that are either Aave or Moonwell related or match our special symbols
    const targetPools = basePools.filter((pool: any) => {
      const symbol = pool.symbol || '';
      const project = pool.project || pool.projectName || '';
      const symbolKey = normalize(symbol);
      const projectKey = normalize(project);

      const hasUsdc = /usdc/i.test(symbol);

      const isTargetProject = TARGET_PROJECT_KEYWORDS.some(k => projectKey.includes(k));
      const isSpecialSymbol = Object.keys(SPECIAL_SYMBOL_MAP).includes(symbolKey);

      // prefer apy field; fall back to apyBase if older data structure
      const poolApy = pool.apy ?? pool.apyBase ?? 0;

      if ((isTargetProject || isSpecialSymbol) && hasUsdc && poolApy > 0 && pool.tvlUsd > 0) {
        console.log('Selected pool:', project, 'symbol:', symbol, 'apy:', poolApy, 'tvl:', pool.tvlUsd);
        return true;
      }
      return false;
    });

    console.log('Matching pools:', targetPools.length);
    if (targetPools.length === 0) return [];

    // Deduplicate by projectKey OR special symbol key, keeping highest TVL
    const map = new Map<string, any>();
    targetPools.forEach((pool: any) => {
      const symbolKey = normalize(pool.symbol);
      const projectKey = normalize(pool.project || pool.projectName || 'unknown');

      // prefer special symbol grouping if present, otherwise project grouping
      const groupKey = Object.keys(SPECIAL_SYMBOL_MAP).includes(symbolKey) ? symbolKey : projectKey;
      const existing = map.get(groupKey);
      if (!existing || (pool.tvlUsd || 0) > (existing.tvlUsd || 0)) {
        map.set(groupKey, pool);
      }
    });

    // Produce result array and map names according to rules
    const result = Array.from(map.values())
  .sort((a: any, b: any) => ((b.apy ?? b.apyBase ?? 0) - (a.apy ?? a.apyBase ?? 0)))
  .slice(0, 5) // keep the top 5 results
      .map((pool: any) => {
        const symbolKey = normalize(pool.symbol);
        const project = pool.project || pool.projectName || '';

        const special = SPECIAL_SYMBOL_MAP[symbolKey];
        // Determine display name: special symbol override > project overrides > title-cased project > title-cased symbol
        let name: string;
        let protocol: string | undefined;
        if (special) {
          name = special.display;
          protocol = special.protocol;
        } else {
          const projectKey = normalize(project);
          if (PROJECT_NAME_OVERRIDES[projectKey]) {
            name = PROJECT_NAME_OVERRIDES[projectKey];
          } else if (project && project.trim().length > 0) {
            name = titleCase(project);
          } else {
            name = titleCase(pool.symbol || 'Unknown');
          }
          protocol = project || pool.symbol;
        }

        return {
          name,
          protocol,
          apy: parseFloat(((pool.apy ?? pool.apyBase) || 0).toFixed(2)),
          tvlUsd: pool.tvlUsd || 0,
          poolId: pool.pool || pool.poolId || ''
        } as YieldPool;
      });

    console.log('Final pools:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}