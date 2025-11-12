// Tools with Real Market Data Integration - Phase 2

import type { WeatherResult, ErrorResult } from './types';
import { mcpManager } from './mcp-client';
import type { Env } from './core-utils';
import { createMarketDataService, MarketDataSignal } from './services/marketData';

export type ToolResult = WeatherResult | { content: string } | ErrorResult | MarketDataSignal | TradeResult;

interface TradeResult {
  success: boolean;
  message: string;
  accountId: number;
  pair: string;
  action: 'BUY' | 'SELL';
  amount: number;
  price: number;
  profitLoss?: number;
  riskScore?: number;
}

interface SerpApiResponse {
  knowledge_graph?: { title?: string; description?: string; source?: { link?: string } };
  answer_box?: { answer?: string; snippet?: string; title?: string; link?: string };
  organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
  local_results?: Array<{ title?: string; address?: string; phone?: string; rating?: number }>;
  error?: string;
}

const customTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_market_data_and_signal',
      description: 'Gets REAL market data with comprehensive analysis including RSI, signal strength, and confidence levels.',
      parameters: {
        type: 'object',
        properties: {
          pair: {
            type: 'string',
            description: 'The currency pair or stock symbol to analyze. Examples: "USD/IDR", "BBCA.JK", "BTC/USD", "EUR/IDR".',
          },
          analysis_depth: {
            type: 'string',
            enum: ['basic', 'detailed', 'comprehensive'],
            description: 'Analysis depth level. Default: detailed',
            default: 'detailed'
          },
        },
        required: ['pair'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_market_overview',
      description: 'Get market overview for Indonesian markets including forex, stocks, and crypto.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['forex', 'stocks', 'crypto', 'all'],
            description: 'Market category to get overview for. Default: all',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_trading_symbols',
      description: 'Search for Indonesian trading symbols including stocks, forex pairs, and cryptocurrencies.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query. Examples: "bank", "bitcoin", "BCA"',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'execute_trade_signal',
      description: 'Executes a simulated trade on a specified account. This is for demonstration only.',
      parameters: {
        type: 'object',
        properties: {
          accountId: {
            type: 'number',
            description: 'The trading account ID. Must be 11266275 for this simulation.',
          },
          pair: {
            type: 'string',
            description: 'The currency pair to trade, e.g., "EUR/USD".',
          },
          action: {
            type: 'string',
            enum: ['BUY', 'SELL'],
            description: 'The trade action to perform.',
          },
          amount: {
            type: 'number',
            description: 'The amount to trade, in base currency.',
          },
        },
        required: ['accountId', 'pair', 'action', 'amount'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Get current weather information for a location',
      parameters: {
        type: 'object',
        properties: { location: { type: 'string', description: 'The city or location name' } },
        required: ['location']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description: 'Search the web using Google or fetch content from a specific URL',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query for Google search' },
          url: { type: 'string', description: 'Specific URL to fetch content from (alternative to search)' },
          num_results: { type: 'number', description: 'Number of search results to return (default: 5, max: 10)', default: 5 }
        },
        required: []
      }
    }
  }
];

export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}

const createSearchUrl = (query: string, apiKey: string, numResults: number) => {
  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine', 'google');
  url.searchParams.set('q', query);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('num', Math.min(numResults, 10).toString());
  return url.toString();
};

const formatSearchResults = (data: SerpApiResponse, query: string, numResults: number): string => {
  const results: string[] = [];
  
  if (data.knowledge_graph?.title && data.knowledge_graph.description) {
    results.push(`**${data.knowledge_graph.title}**\n${data.knowledge_graph.description}`);
    if (data.knowledge_graph.source?.link) results.push(`Source: ${data.knowledge_graph.source.link}`);
  }
  
  if (data.answer_box) {
    const { answer, snippet, title, link } = data.answer_box;
    if (answer) results.push(`**Answer**: ${answer}`);
    else if (snippet) results.push(`**${title || 'Answer'}**: ${snippet}`);
    if (link) results.push(`Source: ${link}`);
  }
  
  if (data.organic_results?.length) {
    results.push('\n**Search Results:**');
    data.organic_results.slice(0, numResults).forEach((result, index) => {
      if (result.title && result.link) {
        const text = [`${index + 1}. **${result.title}**`];
        if (result.snippet) text.push(`   ${result.snippet}`);
        text.push(`   Link: ${result.link}`);
        results.push(text.join('\n'));
      }
    });
  }
  
  return results.length ? `🔍 Search results for "${query}":\n\n${results.join('\n\n')}`
    : `No results found for "${query}". Try: https://www.google.com/search?q=${encodeURIComponent(query)}`;
};

async function performWebSearch(query: string, numResults = 5, env: Env): Promise<string> {
  const apiKey = env.SERPAPI_KEY;
  if (!apiKey) {
    return `🔍 Web search requires SerpAPI key. Get one at https://serpapi.com/\nFallback: https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
  
  try {
    const response = await fetch(createSearchUrl(query, apiKey, numResults), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebBot/1.0)', 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) throw new Error(`SerpAPI returned ${response.status}`);
    const data: SerpApiResponse = await response.json();
    if (data.error) throw new Error(`SerpAPI error: ${data.error}`);
    
    return formatSearchResults(data, query, numResults);
  } catch (error) {
    const isTimeout = error instanceof Error && error.message.includes('timeout');
    const fallback = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    return `Search failed: ${isTimeout ? 'timeout' : 'API error'}. Try: ${fallback}`;
  }
}

const extractTextFromHtml = (html: string): string => html
  .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

async function fetchWebContent(url: string): Promise<string> {
  try {
    new URL(url);
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebBot/1.0)' },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/')) throw new Error('Unsupported content type');
    const html = await response.text();
    const text = extractTextFromHtml(html);
    return text.length ? `Content from ${url}:\n\n${text.slice(0, 4000)}${text.length > 4000 ? '...' : ''}`
      : `No readable content found at ${url}`;
  } catch (error) {
    throw new Error(`Failed to fetch: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeTool(name: string, args: Record<string, unknown>, env: Env): Promise<ToolResult> {
  try {
    // Initialize services
    const marketDataService = createMarketDataService(env);

    switch (name) {
      case 'get_market_data_and_signal': {
        const pair = (args.pair as string) || 'USD/IDR';
        const analysisDepth = (args.analysis_depth as string) || 'detailed';
        
        try {
          const marketData = await marketDataService.getMarketDataAndSignal(pair);
          
          if (analysisDepth === 'comprehensive') {
            return {
              ...marketData,
              content: `📊 **Comprehensive Analysis for ${pair}**

**Current Status:**
• Price: ${marketData.price.toFixed(4)}
• Signal: ${marketData.signal}
• Confidence: ${marketData.confidence}%

**Technical Indicators:**
${marketData.indicators.map(ind => `• ${ind.name}: ${ind.value} (${ind.signal})`).join('\n')}

**AI Reasoning:**
${marketData.reasoning}

**Market Context:**
This analysis is based on real-time data from Yahoo Finance and CoinGecko APIs.`
            };
          }
          
          return marketData;
        } catch (error) {
          return { error: `Failed to get market data for ${pair}: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
      }

      case 'get_market_overview': {
        const category = (args.category as string) || 'all';
        
        try {
          if (category === 'all') {
            const overview = await marketDataService.getIndonesianMarketOverview();
            return {
              content: `📊 **Indonesian Market Overview**

**Forex Pairs:**
${overview.forex.slice(0, 3).map(d => 
  `• ${d.symbol}: ${d.price.toFixed(4)} (${d.changePercent >= 0 ? '+' : ''}${d.changePercent.toFixed(2)}%)`
).join('\n')}

**Indonesian Stocks:**
${overview.stocks.slice(0, 3).map(d => 
  `• ${d.symbol}: Rp${d.price.toLocaleString('id-ID')} (${d.changePercent >= 0 ? '+' : ''}${d.changePercent.toFixed(2)}%)`
).join('\n')}

**Cryptocurrencies:**
${overview.crypto.slice(0, 3).map(d => 
  `• ${d.symbol}: $${d.price.toFixed(2)} (${d.changePercent >= 0 ? '+' : ''}${d.changePercent.toFixed(2)}%)`
).join('\n')}

**Indices:**
${overview.index.map(d => 
  `• ${d.symbol}: ${d.price.toFixed(2)} (${d.changePercent >= 0 ? '+' : ''}${d.changePercent.toFixed(2)}%)`
).join('\n')}

*Data is real-time from multiple sources*`
            };
          } else {
            const movers = await marketDataService.getMarketMovers(category as any);
            return {
              content: `📈 **Market Movers - ${category.toUpperCase()}**

**Top Gainers:**
${movers.gainers.slice(0, 3).map(d => 
  `• ${d.symbol}: ${d.changePercent >= 0 ? '+' : ''}${d.changePercent.toFixed(2)}%`
).join('\n')}

**Top Losers:**
${movers.losers.slice(0, 3).map(d => 
  `• ${d.symbol}: ${d.changePercent >= 0 ? '+' : ''}${d.changePercent.toFixed(2)}%`
).join('\n')}`
            };
          }
        } catch (error) {
          return { error: `Failed to get market overview: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
      }

      case 'search_trading_symbols': {
        const query = (args.query as string) || '';
        
        try {
          const results = await marketDataService.searchSymbols(query);
          return {
            content: `🔍 **Search Results for "${query}"**

${results.map(r => 
  `• **${r.symbol}** - ${r.name} (${r.category}${r.sector ? `, ${r.sector}` : ''})`
).join('\n')}

*Indonesian market symbols only*`
          };
        } catch (error) {
          return { error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
      }

      case 'execute_trade_signal': {
        const { accountId, pair, action, amount, risk_management = true } = args as {
          accountId: number;
          pair: string;
          action: 'BUY' | 'SELL';
          amount: number;
          risk_management?: boolean;
        };
        
        if (accountId !== 11266275) {
          return { error: 'Invalid account ID for this simulation. Please use 11266275.' };
        }

        try {
          const marketData = await marketDataService.getMarketDataAndSignal(pair);
          
          // Risk management checks
          if (risk_management && amount > 10000) {
            return {
              error: 'Position size too large for risk management. Maximum recommended: $10,000 or 1M IDR equivalent.'
            };
          }
          
          const success = Math.random() > 0.1; // 90% success rate
          const profitLoss = success ? amount * (Math.random() * 0.02 - 0.005) : -amount * 0.01;
          
          return {
            success,
            message: success ?
              `✅ Trade executed successfully!
• Pair: ${pair}
• Action: ${action}
• Amount: ${amount.toLocaleString()}
• Entry Price: ${marketData.price.toFixed(4)}
• P&L: ${profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}` :
              `❌ Trade failed due to market volatility.`,
            accountId,
            pair,
            action,
            amount,
            price: marketData.price,
            profitLoss,
            riskScore: Math.random() * 100,
          };
        } catch (error) {
          return { error: `Trade execution failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
      }

      case 'get_weather':
        return {
          location: args.location as string,
          temperature: Math.floor(Math.random() * 40) - 10,
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 100)
        };

      case 'web_search': {
        const { query, url, num_results = 5 } = args;
        
        if (typeof url === 'string') {
          const content = await fetchWebContent(url);
          return { content };
        }
        
        if (typeof query === 'string') {
          const content = await performWebSearch(query, num_results as number, env);
          return { content };
        }
        
        return { error: 'Either query or url parameter is required' };
      }

      case 'analyze_trading_strategy': {
        const { strategy_type, market = 'all', timeframe = '1d' } = args as {
          strategy_type: string;
          market?: string;
          timeframe?: string;
        };

        const strategies = {
          'scalping': {
            description: 'Quick profits from small price movements',
            risk: 'High',
            time_commitment: 'Very High',
            profit_potential: 'Medium',
            suitable_for: ['Experienced traders', 'Professional traders']
          },
          'day_trading': {
            description: 'Buying and selling within the same trading day',
            risk: 'High',
            time_commitment: 'High',
            profit_potential: 'High',
            suitable_for: ['Active traders', 'Part-time professionals']
          },
          'swing_trading': {
            description: 'Holding positions for several days to weeks',
            risk: 'Medium',
            time_commitment: 'Medium',
            profit_potential: 'High',
            suitable_for: ['Working professionals', 'Conservative traders']
          },
          'position_trading': {
            description: 'Long-term position holding (weeks to months)',
            risk: 'Medium',
            time_commitment: 'Low',
            profit_potential: 'Very High',
            suitable_for: ['Patient investors', 'Long-term planners']
          },
          'value_investing': {
            description: 'Investing in undervalued stocks',
            risk: 'Low-Medium',
            time_commitment: 'Low',
            profit_potential: 'Medium-High',
            suitable_for: ['Beginners', 'Risk-averse investors']
          },
          'growth_investing': {
            description: 'Investing in high-growth potential companies',
            risk: 'Medium-High',
            time_commitment: 'Medium',
            profit_potential: 'Very High',
            suitable_for: ['Growth-oriented investors', 'Tech enthusiasts']
          }
        };

        const strategy = strategies[strategy_type as keyof typeof strategies];
        if (!strategy) {
          return { error: `Unknown strategy type: ${strategy_type}` };
        }

        return {
          content: `📈 **Trading Strategy Analysis: ${strategy_type.toUpperCase()}**

**Strategy Overview:**
${strategy.description}

**Risk Level:** ${strategy.risk}
**Time Commitment:** ${strategy.time_commitment}
**Profit Potential:** ${strategy.profit_potential}

**Suitable For:**
${strategy.suitable_for.map(item => `• ${item}`).join('\n')}

**Indonesian Market Application:**
${strategy_type === 'forex' ? 'Best for USD/IDR, EUR/IDR major pairs' :
  strategy_type === 'stocks' ? 'Focus on BBCA.JK, BBRI.JK, BMRI.JK blue chips' :
  strategy_type === 'crypto' ? 'BTC, ETH with Indonesian Rupiah pairs' :
  'Diversified approach across all Indonesian markets'}

**Recommended Timeframe:** ${timeframe}
**Target Market:** ${market.toUpperCase()}

*This analysis is educational and not financial advice.*`
        };
      }

      case 'get_risk_assessment': {
        const { pair, position_size, timeframe = 'medium' } = args as {
          pair: string;
          position_size: number;
          timeframe?: string;
        };

        const riskFactors = {
          'USD/IDR': { volatility: 'Medium', liquidity: 'High', economic_dependency: 'High' },
          'EUR/IDR': { volatility: 'Medium-High', liquidity: 'Medium', economic_dependency: 'Very High' },
          'BTC/USD': { volatility: 'Very High', liquidity: 'High', economic_dependency: 'Medium' },
          'BBCA.JK': { volatility: 'Low', liquidity: 'Very High', economic_dependency: 'High' },
          'BBRI.JK': { volatility: 'Low-Medium', liquidity: 'Very High', economic_dependency: 'High' }
        };

        const pairRisk = riskFactors[pair as keyof typeof riskFactors] || {
          volatility: 'Unknown',
          liquidity: 'Unknown',
          economic_dependency: 'Unknown'
        };

        const riskScore = Math.min(100, (parseFloat(pairRisk.volatility.split('-')[0]) * 10 || 50) * (position_size / 10));

        return {
          content: `⚠️ **Risk Assessment for ${pair}**

**Position Size:** ${position_size}% of portfolio
**Timeframe:** ${timeframe}
**Risk Score:** ${riskScore}/100

**Risk Factors:**
• **Market Volatility:** ${pairRisk.volatility}
• **Liquidity:** ${pairRisk.liquidity}
• **Economic Dependency:** ${pairRisk.economic_dependency}

**Risk Level:** ${riskScore < 30 ? 'Low' : riskScore < 60 ? 'Medium' : 'High'}

**Recommendations:**
${riskScore < 30 ? '✅ Position size is conservative and suitable for most traders.' :
  riskScore < 60 ? '⚡ Consider reducing position size or using tighter stops.' :
  '🚨 High risk position. Consider smaller size or additional risk management.'}

**Indonesian Market Context:**
• **Best Trading Hours:** 09:00-11:30, 13:30-15:30 WIB
• **Economic Events:** Bank Indonesia rates, US Fed decisions
• **Currency Controls:** Be aware of Indonesia\'s foreign exchange regulations

*Risk assessment is for educational purposes only.*`
        };
      }

      case 'get_trading_education': {
        const { topic, level = 'beginner', market = 'all' } = args as {
          topic: string;
          level?: string;
          market?: string;
        };

        const educationalContent = {
          'forex_basics': {
            beginner: `💱 **Forex Trading Basics for Beginners**

**What is Forex?**
Forex (Foreign Exchange) is the largest financial market in the world, where currencies are traded. In Indonesia, the most traded pairs are USD/IDR, EUR/IDR, and SGD/IDR.

**Key Concepts:**
• **Base Currency:** The first currency in a pair (e.g., USD in USD/IDR)
• **Quote Currency:** The second currency (e.g., IDR in USD/IDR)
• **Pip:** The smallest price movement (0.0001 for most pairs)

**Indonesian Forex Market:**
• **Primary Pairs:** USD/IDR, EUR/IDR, SGD/IDR
• **Trading Hours:** 24/5 (Sunday 5 PM - Friday 5 PM WIB)
• **Regulation:** Bank Indonesia oversees the market

**Getting Started:**
1. Learn about economic indicators
2. Understand interest rates impact
3. Practice with demo account
4. Start with micro lots (0.01)
5. Always use risk management`,
            
            intermediate: `📊 **Forex Trading Intermediate Concepts**

**Technical Analysis for Forex:**
• **Support/Resistance:** Key price levels
• **Trend Lines:** Identify market direction
• **Candlestick Patterns:** Understand market sentiment

**Economic Factors in Indonesian Forex:**
• **Bank Indonesia Interest Rates:** Directly affects IDR value
• **US Federal Reserve:** Impacts USD strength globally
• **Indonesia Trade Balance:** Export/import data
• **Inflation Rates:** Both domestic and global

**Risk Management:**
• **Position Sizing:** Never risk more than 2% per trade
• **Stop Losses:** Always protect your capital
• **Risk-Reward Ratio:** Aim for 1:2 minimum

**Popular Strategies:**
• **Carry Trade:** Profit from interest rate differentials
• **Breakout Trading:** Follow momentum after consolidation
• **Range Trading:** Buy support, sell resistance`,
            
            advanced: `🎯 **Advanced Forex Trading Techniques**

**Algorithmic Trading:**
• **Expert Advisors (EAs):** Automated trading systems
• **Backtesting:** Test strategies on historical data
• **Forward Testing:** Validate on demo before live

**Market Microstructure:**
• **Order Flow Analysis:** Understand institutional behavior
• **Market Depth:** Bid/ask spreads and liquidity
• **Tick Volume:** Micro-movements and momentum

**Indonesian Market Specifics:**
• **CFDS Regulation:** Check financial regulations
• **Tax Implications:** Understand Indonesian tax on forex gains
• **Local Brokers:** Compare spreads and commissions

**Risk Advanced Techniques:**
• **Portfolio Heat:** Monitor total portfolio exposure
• **Correlation Analysis:** Understand currency relationships
• **Hedging Strategies:** Protect against adverse moves`
          },
          
          'risk_management': {
            beginner: `🛡️ **Risk Management Fundamentals**

**Why Risk Management Matters:**
• **Preserve Capital:** Your primary goal as a trader
• **Survive Bad Trades:** Even good traders have losing streaks
• **Compound Growth:** Small consistent gains lead to big profits

**Basic Rules:**
• **Never risk more than 2% per trade**
• **Always use stop losses**
• **Maintain proper position sizing**
• **Keep trading journal**

**Position Sizing Formula:**
Position Size = (Account Size × Risk%) / (Entry Price - Stop Loss Price)

**Indonesian Trader Tips:**
• **Start Small:** Begin with 1M IDR or less
• **Focus on USD/IDR:** Most liquid Indonesian pair
• **Understand Margin:** Be aware of leverage effects
• **Local Regulations:** Know Indonesian forex tax implications`,

            intermediate: `⚡ **Advanced Risk Management Strategies**

**Portfolio Approach:**
• **Maximum Daily Loss:** Set daily stop limits
• **Weekly/Monthly Targets:** Realistic profit goals
• **Correlation Risk:** Avoid over-exposure to related assets

**Dynamic Risk Adjustment:**
• **Volatility-based sizing:** Adjust position size based on market volatility
• **Time-based risk:** Reduce risk before major news events
• **Confidence-based scaling:** Increase size after successful trades

**Indonesian Market Risks:**
• **Geopolitical Events:** Regional stability affects markets
• **Commodity Prices:** Indonesia as major commodity exporter
• **Interest Rate Policy:** Bank Indonesia decisions impact IDR

**Risk Metrics:**
• **Sharpe Ratio:** Risk-adjusted returns
• **Maximum Drawdown:** Largest peak-to-trough decline
• **Win Rate vs Average Win/Loss:** Overall profitability analysis`,

            advanced: `🎯 **Professional Risk Management Systems**

**Multi-layered Risk Control:**
• **Portfolio Level:** Overall exposure monitoring
• **Sector Level:** Industry/currency group exposure
• **Position Level:** Individual trade risk
• **Time Level:** Hourly/daily risk monitoring

**Quantitative Risk Models:**
• **Value at Risk (VaR):** Maximum expected loss
• **Monte Carlo Simulations:** Multiple scenario analysis
• **Stress Testing:** Extreme market condition analysis

**Indonesian Regulatory Compliance:**
• **Reporting Requirements:** Tax reporting for gains
• **Leverage Limits:** Understand maximum leverage allowed
• **Broker Requirements:** Licensed Indonesian brokers

**Technology Integration:**
• **Real-time Monitoring:** Automated risk alerts
• **API Integration:** Connect multiple data sources
• **Machine Learning:** Pattern recognition in risk factors`
          }
        };

        const topicContent = educationalContent[topic as keyof typeof educationalContent];
        const content = topicContent?.[level as keyof typeof topicContent];
        if (!content) {
          return { error: `Educational content not found for ${topic} at ${level} level` };
        }

        return {
          content: `${content}

**Indonesian Trading Context:**
This educational material is specifically tailored for Indonesian traders, covering local market dynamics, regulations, and best practices. Always combine theoretical knowledge with practical experience.

*This is educational content only, not financial advice.*`
        };
      }

      case 'calculate_position_size': {
        const { account_balance, risk_percentage, stop_loss_pips, pair } = args as {
          account_balance: number;
          risk_percentage: number;
          stop_loss_pips: number;
          pair: string;
        };

        if (risk_percentage > 5) {
          return {
            error: 'Risk percentage too high. Recommended maximum: 2-3% for experienced traders, 1% for beginners.'
          };
        }

        const risk_amount = account_balance * (risk_percentage / 100);
        const pip_values = {
          'USD/IDR': 0.01,
          'EUR/IDR': 0.01,
          'GBP/IDR': 0.01,
          'JPY/IDR': 0.1,
          'BTC/USD': 1,
          'ETH/USD': 0.1
        };

        const pip_value = pip_values[pair as keyof typeof pip_values] || 0.01;
        const position_size = risk_amount / (stop_loss_pips * pip_value);

        return {
          content: `📊 **Position Size Calculator**

**Account Balance:** ${account_balance.toLocaleString('id-ID')} IDR
**Risk per Trade:** ${risk_percentage}%
**Risk Amount:** ${risk_amount.toLocaleString('id-ID')} IDR
**Stop Loss:** ${stop_loss_pips} pips
**Pair:** ${pair}

**Recommended Position Size:**
• **${pair}:** ${position_size.toFixed(2)} units

**Position Breakdown:**
• **Risk Amount:** ${risk_amount.toLocaleString('id-ID')} IDR
• **Pip Value:** ${pip_value} IDR
• **Stop Loss Distance:** ${stop_loss_pips} pips
• **Maximum Loss:** ${risk_amount.toLocaleString('id-ID')} IDR

**Safety Guidelines:**
${risk_percentage <= 1 ? '✅ Conservative risk level - Safe for beginners' :
  risk_percentage <= 2 ? '⚡ Moderate risk level - Suitable for experienced traders' :
  '⚠️ High risk level - Only for professional traders'}

**Indonesian Market Considerations:**
• **Micro Lots:** Start with smaller positions
• **IDR Conversion:** Account for USD/IDR rate fluctuations
• **Local Brokers:** Check minimum lot sizes (usually 0.01)

*This calculation is for educational purposes only.*`
        };
      }

      default: {
        const content = await mcpManager.executeTool(name, args);
        return { content };
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
