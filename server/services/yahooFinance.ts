import { spawn } from 'child_process';
import path from 'path';
import { InsertCompany } from '@shared/schema';

export interface YahooFinanceData {
  symbol: string;
  companyName: string;
  price: number;
  pe: number;
  pyEps: number;
  cyEpsLow?: number;
  cyEpsAvg: number;
  cyEpsHigh?: number;
  cyEpsChangePercentLow?: number;
  cyEpsChangePercentAvg: number;
  cyEpsChangePercentHigh?: number;
  cyPeLow?: number;
  cyPeAvg: number;
  cyPeHigh?: number;
  cyPegLow?: number;
  cyPegAvg: number;
  cyPegHigh?: number;
  nyEpsLow?: number;
  nyEpsAvg: number;
  nyEpsHigh?: number;
  nyEpsChangePercentLow?: number;
  nyEpsChangePercentAvg: number;
  nyEpsChangePercentHigh?: number;
  nyPeLow?: number;
  nyPeAvg: number;
  nyPeHigh?: number;
  nyPegLow?: number;
  nyPegAvg: number;
  nyPegHigh?: number;
  error?: string;
}

export async function fetchStockData(symbol: string): Promise<YahooFinanceData> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'server', 'python', 'fetch_stock_data.py');
    const pythonProcess = spawn('python3', [pythonScript, symbol]);
    
    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${errorString}`));
        return;
      }

      try {
        const result = JSON.parse(dataString.trim());
        if (result.error) {
          reject(new Error(result.error));
          return;
        }
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse JSON response: ${dataString}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to spawn python process: ${error.message}`));
    });
  });
}

export function convertToInsertCompany(data: YahooFinanceData): InsertCompany {
  return {
    symbol: data.symbol,
    companyName: data.companyName,
    price: data.price,
    pe: data.pe,
    pyEps: data.pyEps,
    cyEpsLow: data.cyEpsLow || null,
    cyEpsAvg: data.cyEpsAvg,
    cyEpsHigh: data.cyEpsHigh || null,
    cyEpsChangePercentLow: data.cyEpsChangePercentLow || null,
    cyEpsChangePercentAvg: data.cyEpsChangePercentAvg,
    cyEpsChangePercentHigh: data.cyEpsChangePercentHigh || null,
    cyPeLow: data.cyPeLow || null,
    cyPeAvg: data.cyPeAvg,
    cyPeHigh: data.cyPeHigh || null,
    cyPegLow: data.cyPegLow || null,
    cyPegAvg: data.cyPegAvg,
    cyPegHigh: data.cyPegHigh || null,
    nyEpsLow: data.nyEpsLow || null,
    nyEpsAvg: data.nyEpsAvg,
    nyEpsHigh: data.nyEpsHigh || null,
    nyEpsChangePercentLow: data.nyEpsChangePercentLow || null,
    nyEpsChangePercentAvg: data.nyEpsChangePercentAvg,
    nyEpsChangePercentHigh: data.nyEpsChangePercentHigh || null,
    nyPeLow: data.nyPeLow || null,
    nyPeAvg: data.nyPeAvg,
    nyPeHigh: data.nyPeHigh || null,
    nyPegLow: data.nyPegLow || null,
    nyPegAvg: data.nyPegAvg,
    nyPegHigh: data.nyPegHigh || null,
  };
}
