import { CapitalService } from '../lib/services/market-data/capital';
import { CapitalAuthService } from '../lib/services/market-data/capital/auth';
import type { Timeframe } from '../lib/types/forex';

async function verifyCapitalService() {
  try {
    console.log('Initializing Capital.com service...');
    
    const authService = CapitalAuthService.getInstance();
    await authService.initialize({
      apiKey: 'BN66hb0IzRdHKkWR',
      identifier: 'jozaguts@gmail.com',
      password: 'Jozaguts2024@'
    });

    const service = new CapitalService(authService);
    
    // Test basic data fetching
    console.log('\nTesting EUR/USD 1h data fetch...');
    const result = await service.fetchData('EUR/USD', '1h' as Timeframe);
    console.log(`Fetched ${result.data.length} candles`);
    console.log('First candle:', result.data[0]);
    console.log('Metadata:', result.metadata);

    // Test different timeframes
    const timeframes: Timeframe[] = ['5m', '15m', '1h', '4h'];
    console.log('\nTesting multiple timeframes...');
    for (const timeframe of timeframes) {
      console.log(`\nFetching ${timeframe} data...`);
      const tfResult = await service.fetchData('EUR/USD', timeframe);
      console.log(`Fetched ${tfResult.data.length} candles for ${timeframe}`);
    }

    // Test different pairs
    const pairs = ['GBP/USD', 'USD/JPY', 'EUR/GBP'];
    console.log('\nTesting multiple pairs...');
    for (const pair of pairs) {
      console.log(`\nFetching ${pair} data...`);
      const pairResult = await service.fetchData(pair, '1h' as Timeframe);
      console.log(`Fetched ${pairResult.data.length} candles for ${pair}`);
    }

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  }
}

verifyCapitalService(); 