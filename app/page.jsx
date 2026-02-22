import Link from "next/link";
import Login from "./components/Login.jsx";

export default function RadialBackground() {
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

      {/* Link to Login */}
      <div className="absolute bottom-10 w-full text-center z-30">
        <Login/>
      </div>
    </div>
  );
}