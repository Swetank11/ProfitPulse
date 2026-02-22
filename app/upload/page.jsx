"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setMessage(data.message || data.error);

      if (res.ok) {
        // ✅ Redirect to portfolio page after successful upload
        router.push("/portfolio");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <img
        src="/bg1.png"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

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
        <img
          src="/pic-1.png"
          className="absolute top-20 left-10 blur-sm animate-floatX z-20"
        />
        <img
          src="/pic-1.png"
          className="absolute top-40 right-20 blur-sm animate-floatY z-20 delay-[2000ms]"
        />
        <img
          src="/pic-2.png"
          className="absolute bottom-10 left-10 blur-sm animate-floatDiagonal z-20 delay-[2000ms]"
        />
        <img
          src="/pic-2.png"
          className="absolute bottom-10 right-10 blur-sm animate-floatX z-20 delay-[2000ms]"
        />
      </div>

      {/* Centered Upload Box */}
      <div className="relative z-30 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-lg p-10 rounded-3xl shadow-2xl
                        bg-white/10 backdrop-blur-md border border-white/20 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-8 drop-shadow-lg">
            Upload Customer Investments
          </h2>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-6"
          >
            <input
              type="file"
              name="file"
              accept=".xlsx"
              required
              className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-gray-300
                         border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600
                         text-white font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </form>

          {message && (
            <p className="mt-6 text-lg text-white font-medium">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}