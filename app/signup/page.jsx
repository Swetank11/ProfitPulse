"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSignup(e) {
    e.preventDefault();

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ " + data.message);
        // Example: redirect to login after signup
        // window.location.href = "/login";
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <img src="/bg1.png" className="absolute inset-0 w-full h-full object-cover z-0" />

      {/* Video Overlay */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-10"
      >
        <source src="/overlay.mp4" type="video/mp4" />
      </video>

      {/* Floating Images */}
      <div className="absolute inset-0 z-20">
        <img src="/pic-1.png" className="absolute top-20 left-10 blur-sm animate-floatX z-20" />
        <img src="/pic-1.png" className="absolute top-40 right-20 blur-sm animate-floatY z-20 delay-[2000ms]" />
        <img src="/pic-2.png" className="absolute bottom-10 left-10 blur-sm animate-floatDiagonal z-20 delay-[2000ms]" />
        <img src="/pic-2.png" className="absolute bottom-10 right-10 blur-sm animate-floatX z-20 delay-[2000ms]" />
      </div>

      {/* Centered Signup Form */}
      <div className="flex items-center justify-center min-h-screen z-30 relative">
        <div className="w-full max-w-2xl min-h-[600px] p-12 rounded-2xl shadow-2xl
                        bg-white/10 backdrop-blur-md border border-white/20">
          
          <h2 className="text-4xl font-extrabold text-white text-center mb-10 drop-shadow-lg">
            Sign Up
          </h2>

          <form onSubmit={handleSignup} className="space-y-6">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-5 text-lg rounded-xl bg-white/20 text-white placeholder-gray-400
                         border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-5 text-lg rounded-xl bg-white/20 text-white placeholder-gray-400
                         border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-5 text-lg rounded-xl bg-white/20 text-white placeholder-gray-400
                         border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <button
              type="submit"
              className="w-full p-5 text-lg rounded-xl bg-gradient-to-r from-pink-500 to-purple-600
                         text-white font-semibold shadow-lg hover:opacity-90 transition"
            >
              Create Account
            </button>
          </form>

          <p className="mt-8 text-center text-base text-gray-300">
            Already have an account?{" "}
            <Link href="/" className="text-blue-400 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}