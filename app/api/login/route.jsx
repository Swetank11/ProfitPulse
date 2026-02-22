import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/mongodb"; // helper file we created

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("profitpulse"); // replace with your DB name
    const users = db.collection("users");

    // Find user by email
    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Compare password with stored hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Success
    return NextResponse.json(
      { message: "Login successful!", user: { name: user.name, email: user.email } },
      { status: 200 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}