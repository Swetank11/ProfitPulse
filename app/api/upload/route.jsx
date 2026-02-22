import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import axios from "axios";
import clientPromise from "@/lib/mongodb"; // adjust path to your MongoDB connection helper

// Handle file upload and insert investments
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("profitpulse");
    const investments = db.collection("investments");

    for (const row of data) {
      const { CustomerID, CustomerName, Symbol, Quantity, PurchaseDate } = row;

      // Accept either PurchasePrice or PurchasePrize
      const purchaseField = row.PurchasePrice ?? row.PurchasePrize;
      const purchasePrice = purchaseField ? parseFloat(purchaseField) : null;
      const costBasis = purchasePrice ? purchasePrice * Quantity : null;

      let price = null;

      try {
        if (Symbol.endsWith("USD")) {
          // Handle crypto (BTCUSD, ETHUSD, etc.)
          const res = await axios.get("https://www.alphavantage.co/query", {
            params: {
              function: "CURRENCY_EXCHANGE_RATE",
              from_currency: Symbol.replace("USD", ""),
              to_currency: "USD",
              apikey: process.env.ALPHA_VANTAGE_API_KEY,
            },
          });

          const rate = res.data["Realtime Currency Exchange Rate"];
          if (rate && rate["5. Exchange Rate"]) {
            price = parseFloat(rate["5. Exchange Rate"]);
          }
        } else {
          // Handle stocks
          const res = await axios.get("https://www.alphavantage.co/query", {
            params: {
              function: "GLOBAL_QUOTE",
              symbol: Symbol,
              apikey: process.env.ALPHA_VANTAGE_API_KEY,
            },
          });

          const quote = res.data["Global Quote"];
          if (quote && quote["05. price"]) {
            price = parseFloat(quote["05. price"]);
          }
        }
      } catch (err) {
        console.error(`Error fetching price for ${Symbol}:`, err.message);
      }

      if (!price) {
        console.warn(`Skipping ${Symbol} — no price data returned`);
        continue;
      }

      await investments.insertOne({
        customerId: CustomerID,
        customerName: CustomerName,
        symbol: Symbol,
        quantity: Quantity,
        purchaseDate: PurchaseDate,
        purchasePrice: purchasePrice, // NEW field
        costBasis: costBasis,         // NEW field
        currentPrice: price,
        totalValue: price * Quantity,
      });
    }

    return NextResponse.json({
      message: "Investments uploaded successfully!",
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}