"use client";

import { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function PortfolioPage() {
  const [investments, setInvestments] = useState([]);
  const [currentTime, setCurrentTime] = useState("");

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/portfolio");
        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        setInvestments(data?.investments || []);
      } catch (err) {
        console.error("Failed to fetch investments", err);
      }
    }

    fetchData();
  }, []);

  /* ---------------- LIVE CLOCK ---------------- */
  useEffect(() => {
    const updateTime = () =>
      setCurrentTime(new Date().toLocaleString());

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ---------------- SUMMARY ---------------- */
  const totalValue = investments.reduce(
    (sum, inv) => sum + Number(inv.totalValue || 0),
    0
  );

  const totalInvestments = investments.length;

  /* ---------------- PIE DATA ---------------- */
  const getInvestmentPieData = (inv) => {
    const costBasis = Number(inv.costBasis || 0);
    const currentValue = Number(inv.totalValue || 0);
    const profit = Math.max(currentValue - costBasis, 0);

    return {
      labels: ["Cost Basis", "Profit"],
      datasets: [
        {
          label: `${inv.symbol} Profitability`,
          data: [costBasis, profit],
          backgroundColor: ["#36A2EB", "#FF6384"],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  };

  /* ---------------- BAR DATA (PER STOCK) ---------------- */
  const getInvestmentBarData = (inv) => {
    const costBasis = Number(inv.costBasis || 0);
    const currentValue = Number(inv.totalValue || 0);
    const profit = currentValue - costBasis;

    return {
      labels: ["Cost Basis", "Current Value", "Profit"],
      datasets: [
        {
          label: inv.symbol,
          data: [costBasis, currentValue, profit],
          backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
        },
      ],
    };
  };

  /* ---------------- PORTFOLIO BAR ---------------- */
  const getPortfolioBarData = () => {
    const totalCostBasis = investments.reduce(
      (sum, inv) => sum + Number(inv.costBasis || 0),
      0
    );

    const totalValueCalc = investments.reduce(
      (sum, inv) => sum + Number(inv.totalValue || 0),
      0
    );

    const totalProfit = totalValueCalc - totalCostBasis;

    return {
      labels: ["Total Cost", "Current Value", "Profit"],
      datasets: [
        {
          label: "Portfolio",
          data: [totalCostBasis, totalValueCalc, totalProfit],
          backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
        },
      ],
    };
  };

  /* ================= UI ================= */
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg1.png"
          alt="background"
          className="w-full h-full object-cover"
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        >
          <source src="/overlay.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center min-h-screen p-10 space-y-10">
        {/* Welcome */}
        <div className="w-full p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <div className="flex justify-between gap-20">
            <div className="flex-1 p-8 rounded-2xl bg-white/10 border border-white/20 text-center">
              <h2 className="text-5xl font-extrabold text-white">
                Welcome
              </h2>
            </div>

            <div className="flex-1 p-8 rounded-2xl bg-white/10 border border-white/20 text-center">
              <p className="text-4xl font-bold text-white">
                {currentTime}
              </p>
            </div>
          </div>
        </div>

        {/* Investments List */}
        <div className="w-full p-8 rounded-3xl bg-white/10 border border-white/20 text-white">
          <h3 className="text-3xl font-bold mb-6 text-center">
            Investments
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto">
            {investments.map((inv, idx) => {
              const costBasis = Number(inv.costBasis || 0);
              const currentValue = Number(inv.totalValue || 0);
              const profit = currentValue - costBasis;

              return (
                <div
                  key={`${inv.symbol}-${idx}`}
                  className="p-6 rounded-2xl bg-white/10 border border-white/20"
                >
                  <h4 className="text-2xl font-bold mb-2">
                    Investment {idx + 1}
                  </h4>

                  <p>{inv.customerName} — {inv.symbol}</p>
                  <p>Qty: {inv.quantity}</p>
                  <p>Purchase Price: {Number(inv.purchasePrice || 0).toFixed(2)}</p>
                  <p>Current Price: {Number(inv.currentPrice || 0).toFixed(2)}</p>
                  <p>Total Value: {currentValue.toFixed(2)}</p>

                  <p className={profit >= 0 ? "text-green-400" : "text-red-400"}>
                    Profit/Loss: {profit.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="w-full p-8 rounded-3xl bg-white/10 border border-white/20 text-white text-center grid grid-cols-2 gap-10">
          <div>
            <h3 className="text-2xl font-bold">Total Investments</h3>
            <p className="text-3xl mt-2">{totalInvestments}</p>
          </div>

          <div>
            <h3 className="text-2xl font-bold">Portfolio Value</h3>
            <p className="text-3xl mt-2">${totalValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="w-full p-8 rounded-3xl bg-white/10 border border-white/20 text-white">
          <h3 className="text-3xl font-bold mb-6 text-center">
            Portfolio Overview
          </h3>

          <div className="w-full h-64">
            <Bar data={getPortfolioBarData()} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Pie Charts */}
        <div className="w-full p-8 rounded-3xl bg-white/10 border border-white/20 text-white">
          <h3 className="text-3xl font-bold mb-6 text-center">
            Investment Profitability
          </h3>

          <div className="flex gap-6 overflow-x-auto">
            {investments.map((inv, idx) => (
              <div key={`pie-${idx}`} className="min-w-[250px] h-64 flex flex-col items-center">
                <h4 className="font-bold mb-2">{inv.symbol}</h4>

                {/* ✅ ONLY STYLE ADDED HERE */}
                <div className="relative w-52 h-52 flex items-center justify-center rounded-full bg-gradient-to-br from-black/80 via-gray-700 to-black p-[6px]">
                  <div className="w-full h-full rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                    <div className="w-44 h-44">
                      <Pie data={getInvestmentPieData(inv)} />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Bar Graphs per Investment */}
        <div className="w-full p-8 rounded-3xl bg-white/10 border border-white/20 text-white">
          <h3 className="text-3xl font-bold mb-6 text-center">
            Investment Bar Graphs
          </h3>

          <div className="flex gap-6 overflow-x-auto pb-2">
            {investments.map((inv, idx) => (
              <div
                key={`bar-${idx}`}
                className="min-w-[300px] h-64 flex flex-col items-center justify-center bg-white/10 border border-white/20 rounded-2xl p-4"
              >
                <h4 className="font-bold mb-2">{inv.symbol}</h4>

                <div className="w-full h-48">
                  <Bar
                    data={getInvestmentBarData(inv)}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}