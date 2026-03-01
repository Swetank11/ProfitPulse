import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import axios from "axios";
import clientPromise from "@/lib/mongodb";

/* ================= PRICE CACHE ================= */
const priceCache = {};
let forexSymbolsCache = {}; // dynamic forex symbol mapping

/* ================= LOAD FOREX SYMBOLS ================= */
async function loadForexSymbols() {
  if (Object.keys(forexSymbolsCache).length > 0) return forexSymbolsCache;

  try {
    const res = await axios.get("https://finnhub.io/api/v1/forex/symbol", {
      params: { exchange: "oanda", token: process.env.FINNHUB_API_KEY }
    });
    res.data.forEach(s => {
      // Example: { "symbol": "OANDA:EUR_USD", "displaySymbol": "EUR/USD" }
      const key = s.displaySymbol.replace("/", "");
      forexSymbolsCache[key] = s.symbol;
    });
    console.log("Loaded forex symbols:", forexSymbolsCache);
  } catch (err) {
    console.error("Failed to load forex symbols:", err.message);
  }
  return forexSymbolsCache;
}

/* ================= SYMBOL FORMAT ================= */
async function resolveSymbol(rawSymbol) {
  const symbol = rawSymbol.trim().toUpperCase();
  const cryptoTickers = ["BTC", "ETH", "SOL", "ADA", "XRP", "DOGE", "MATIC"];

  // Handle crypto pairs like BTCUSD, ETHUSD, SOLUSD
  if (cryptoTickers.some(t => symbol.startsWith(t))) {
    return { type: "CRYPTO", cacheKey: symbol, formatted: `BINANCE:${symbol}` };
  }

  // Handle forex pairs dynamically
  const forexMap = await loadForexSymbols();
  if (forexMap[symbol]) {
    return { type: "FOREX", cacheKey: symbol, formatted: forexMap[symbol] };
  }

  if (symbol.endsWith("ETF")) return { type: "ETF", cacheKey: symbol, formatted: symbol };
  if (symbol.endsWith("FUND")) return { type: "MUTUAL_FUND", cacheKey: symbol, formatted: symbol };
  if (symbol.startsWith("^")) return { type: "INDEX", cacheKey: symbol, formatted: symbol };

  const commodityTickers = ["GOLD", "SILVER", "OIL", "NG"];
  if (commodityTickers.includes(symbol)) return { type: "COMMODITY", cacheKey: symbol, formatted: symbol };

  return { type: "STOCK", cacheKey: symbol, formatted: symbol };
}

/* ================= UNIVERSAL PRICE PARSER ================= */
function extractPrice(obj) {
  if (!obj) return null;
  return obj.c || obj.price || obj.close || obj.lastPrice || null; // Finnhub returns `c` for current price
}

/* ================= FETCH PRICE ================= */
async function fetchPrice(rawSymbol) {
  const resolved = await resolveSymbol(rawSymbol);
  const cacheKey = resolved.cacheKey;

  if (priceCache[cacheKey] !== undefined) return priceCache[cacheKey];

  try {
    console.log("API KEY being used:", process.env.FINNHUB_API_KEY);
    let res, price = null;

    console.log("Fetching:", rawSymbol, "as", resolved.type);

    switch (resolved.type) {
      case "CRYPTO":
      case "ETF":
      case "MUTUAL_FUND":
      case "INDEX":
      case "STOCK":
        res = await axios.get(
          `https://finnhub.io/api/v1/quote`,
          { params: { symbol: resolved.formatted, token: process.env.FINNHUB_API_KEY } }
        );
        console.log("Quote response:", JSON.stringify(res.data, null, 2));
        price = extractPrice(res.data);
        break;

      case "FOREX":
        res = await axios.get(
          `https://finnhub.io/api/v1/forex/candle`,
          {
            params: {
              symbol: resolved.formatted,
              resolution: "1",
              from: Math.floor(Date.now() / 1000) - 3600, // last hour
              to: Math.floor(Date.now() / 1000),
              token: process.env.FINNHUB_API_KEY
            }
          }
        );
        console.log("Forex response:", JSON.stringify(res.data, null, 2));
        if (res.data && res.data.c && res.data.c.length > 0) {
          price = res.data.c[res.data.c.length - 1]; // latest close price
        }
        break;

      case "COMMODITY":
        console.warn("Commodity not supported by Finnhub:", rawSymbol);
        price = 0; // fallback placeholder
        break;

      default:
        console.warn("Unsupported type:", resolved.type);
        return null;
    }

    if (!price) {
      console.warn("No price found for:", rawSymbol);
      priceCache[cacheKey] = null;
      return null;
    }

    const parsed = parseFloat(price);
    priceCache[cacheKey] = parsed;
    console.log("✅", rawSymbol, parsed);
    return parsed;
  } catch (err) {
    console.error("API error:", err.message);
    priceCache[cacheKey] = null;
    return null;
  }
}

/* ================= POST ================= */
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const buffer = Buffer.from(await file.arrayBuffer());

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const client = await clientPromise;
    const db = client.db("profitpulse");
    const collection = db.collection("investments");

    const symbols = [...new Set(data.map(r => r.Symbol?.toString().trim()).filter(Boolean))];
    console.log("Symbols:", symbols);

    for (const symbol of symbols) {
      await fetchPrice(symbol);
    }

    const docs = data.map(row => {
      const symbol = row.Symbol?.toString().trim().toUpperCase();
      const quantity = parseFloat(row.Quantity) || 0;
      const purchasePrice = parseFloat(row.PurchasePrice || row.PurchasePrize) || 0;
      const costBasis = purchasePrice * quantity;

      const resolved = { type: "UNKNOWN", cacheKey: symbol };
      try {
        Object.assign(resolved, resolveSymbol(symbol));
      } catch (e) {
        console.warn("Resolve failed for:", symbol);
      }

      const type = row.Type?.toUpperCase() || resolved.type;
      const price = priceCache[resolved.cacheKey] ?? null;

      console.log("Row parsed:", row);

      return {
        customerId: row.CustomerID ?? null,
        customerName: row.CustomerName ?? null,
        symbol,
        type,
        quantity,
        purchaseDate: row.PurchaseDate ?? null,
        purchasePrice,
        costBasis,
        currentPrice: price,
        totalValue: price ? price * quantity : null,
        status: price ? "ok" : "pending",
        createdAt: new Date(),
      };
    });

    await collection.insertMany(docs);
    return NextResponse.json({ message: "Upload successful" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}