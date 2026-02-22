"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ " + data.message);
        // ✅ Redirect to upload page after login
        router.push("/upload");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-full max-w-xl min-h-[600px] p-12 rounded-3xl shadow-2xl
                      bg-white/10 backdrop-blur-md border border-white/20">
        
        <h2 className="text-4xl font-extrabold text-white text-center mb-10 drop-shadow-lg">
          Login to ProfitPulse
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-5 text-lg rounded-xl bg-white/20 text-white placeholder-gray-500
                       border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-5 text-lg rounded-xl bg-white/20 text-white placeholder-gray-500
                       border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <button
            type="submit"
            className="w-full p-5 text-lg rounded-xl bg-gradient-to-r from-pink-500 to-purple-600
                       text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            Login
          </button>
        </form>

        <p className="mt-8 text-center text-lg text-gray-500">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}