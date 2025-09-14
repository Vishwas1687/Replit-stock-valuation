import sys
import json
import yfinance as yf
import pandas as pd
from typing import Dict, Any, Optional

def fetch_stock_data(symbol: str) -> Dict[str, Any]:
    """
    Fetch comprehensive stock data from Yahoo Finance
    """
    try:
        ticker = yf.Ticker(symbol)
        
        # Get basic info
        info = ticker.info
        if not info or 'symbol' not in info:
            return {"error": f"Invalid symbol: {symbol}"}
        
        # Get historical data for price calculation
        hist = ticker.history(period="1y")
        if hist.empty:
            return {"error": f"No historical data for: {symbol}"}
        
        current_price = float(hist['Close'].iloc[-1])
        
        # Extract financial data with fallbacks
        company_name = info.get('longName') or info.get('shortName') or symbol
        
        # Current financial metrics
        trailing_pe = info.get('trailingPE', 0)
        trailing_eps = info.get('trailingEps', 0)
        
        # Analyst estimates - Yahoo Finance provides various estimates
        current_estimate_low = info.get('earningsEstimate', {}).get('low', None)
        current_estimate_avg = info.get('earningsEstimate', {}).get('avg', trailing_eps * 1.1)
        current_estimate_high = info.get('earningsEstimate', {}).get('high', None)
        
        # Next year estimates
        next_estimate_low = info.get('nextYearEPS', {}).get('low', None) if isinstance(info.get('nextYearEPS'), dict) else None
        next_estimate_avg = info.get('nextYearEPS', current_estimate_avg * 1.15) if not isinstance(info.get('nextYearEPS'), dict) else info.get('nextYearEPS', {}).get('avg', current_estimate_avg * 1.15)
        next_estimate_high = info.get('nextYearEPS', {}).get('high', None) if isinstance(info.get('nextYearEPS'), dict) else None
        
        # Calculate growth rates
        cy_growth = ((current_estimate_avg - trailing_eps) / trailing_eps * 100) if trailing_eps > 0 else 0
        ny_growth = ((next_estimate_avg - current_estimate_avg) / current_estimate_avg * 100) if current_estimate_avg > 0 else 0
        
        # Calculate P/E ratios
        cy_pe_avg = (current_price / current_estimate_avg) if current_estimate_avg > 0 else 0
        ny_pe_avg = (current_price / next_estimate_avg) if next_estimate_avg > 0 else 0
        
        # Calculate PEG ratios
        cy_peg_avg = (cy_pe_avg / abs(cy_growth)) if cy_growth != 0 else 0
        ny_peg_avg = (ny_pe_avg / abs(ny_growth)) if ny_growth != 0 else 0
        
        # Calculate ranges (estimated based on typical variance)
        def calculate_range(avg_val, variance=0.15):
            if avg_val is None or avg_val <= 0:
                return None, avg_val, None
            low = avg_val * (1 - variance)
            high = avg_val * (1 + variance)
            return low, avg_val, high
        
        cy_eps_low, cy_eps_avg, cy_eps_high = calculate_range(current_estimate_avg)
        ny_eps_low, ny_eps_avg, ny_eps_high = calculate_range(next_estimate_avg)
        
        # Calculate P/E ranges
        cy_pe_low = (current_price / cy_eps_high) if cy_eps_high and cy_eps_high > 0 else None
        cy_pe_high = (current_price / cy_eps_low) if cy_eps_low and cy_eps_low > 0 else None
        
        ny_pe_low = (current_price / ny_eps_high) if ny_eps_high and ny_eps_high > 0 else None
        ny_pe_high = (current_price / ny_eps_low) if ny_eps_low and ny_eps_low > 0 else None
        
        # Calculate PEG ranges
        growth_variance = 5  # 5% variance in growth estimates
        cy_growth_low = max(cy_growth - growth_variance, 0.1)  # Minimum 0.1% to avoid division by zero
        cy_growth_high = cy_growth + growth_variance
        
        ny_growth_low = max(ny_growth - growth_variance, 0.1)
        ny_growth_high = ny_growth + growth_variance
        
        cy_peg_low = (cy_pe_low / cy_growth_high) if cy_pe_low and cy_growth_high > 0 else None
        cy_peg_high = (cy_pe_high / cy_growth_low) if cy_pe_high and cy_growth_low > 0 else None
        
        ny_peg_low = (ny_pe_low / ny_growth_high) if ny_pe_low and ny_growth_high > 0 else None
        ny_peg_high = (ny_pe_high / ny_growth_low) if ny_pe_high and ny_growth_low > 0 else None
        
        return {
            "symbol": symbol.upper(),
            "companyName": company_name,
            "price": round(current_price, 2),
            "pe": round(trailing_pe, 2) if trailing_pe else 0,
            "pyEps": round(trailing_eps, 2) if trailing_eps else 0,
            
            # Current Year
            "cyEpsLow": round(cy_eps_low, 2) if cy_eps_low else None,
            "cyEpsAvg": round(cy_eps_avg, 2),
            "cyEpsHigh": round(cy_eps_high, 2) if cy_eps_high else None,
            "cyEpsChangePercentLow": round(cy_growth - 5, 1) if cy_growth else None,
            "cyEpsChangePercentAvg": round(cy_growth, 1),
            "cyEpsChangePercentHigh": round(cy_growth + 5, 1) if cy_growth else None,
            "cyPeLow": round(cy_pe_low, 2) if cy_pe_low else None,
            "cyPeAvg": round(cy_pe_avg, 2),
            "cyPeHigh": round(cy_pe_high, 2) if cy_pe_high else None,
            "cyPegLow": round(cy_peg_low, 2) if cy_peg_low else None,
            "cyPegAvg": round(cy_peg_avg, 2),
            "cyPegHigh": round(cy_peg_high, 2) if cy_peg_high else None,
            
            # Next Year
            "nyEpsLow": round(ny_eps_low, 2) if ny_eps_low else None,
            "nyEpsAvg": round(ny_eps_avg, 2),
            "nyEpsHigh": round(ny_eps_high, 2) if ny_eps_high else None,
            "nyEpsChangePercentLow": round(ny_growth - 5, 1) if ny_growth else None,
            "nyEpsChangePercentAvg": round(ny_growth, 1),
            "nyEpsChangePercentHigh": round(ny_growth + 5, 1) if ny_growth else None,
            "nyPeLow": round(ny_pe_low, 2) if ny_pe_low else None,
            "nyPeAvg": round(ny_pe_avg, 2),
            "nyPeHigh": round(ny_pe_high, 2) if ny_pe_high else None,
            "nyPegLow": round(ny_peg_low, 2) if ny_peg_low else None,
            "nyPegAvg": round(ny_peg_avg, 2),
            "nyPegHigh": round(ny_peg_high, 2) if ny_peg_high else None,
        }
        
    except Exception as e:
        return {"error": f"Error fetching data for {symbol}: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Please provide a stock symbol"}))
        sys.exit(1)
    
    symbol = sys.argv[1]
    result = fetch_stock_data(symbol)
    print(json.dumps(result))
