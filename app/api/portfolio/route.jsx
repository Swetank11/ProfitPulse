import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId"); // optional filter

  const client = await clientPromise;
  const db = client.db("profitpulse");
  const investments = db.collection("investments");

  let query = {};
  if (customerId) query.customerId = customerId;

  const data = await investments.find(query).toArray();

  return NextResponse.json({ investments: data });
}