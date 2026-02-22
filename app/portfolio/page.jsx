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

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/portfolio");
        const data = await res.json();
        setInvestments(data.investments || []);
      } catch (err) {
        console.error("Failed to fetch investments", err);
      }
    }
    fetchData();
  }, []);

  // Summary metrics
  const totalValue = investments.reduce(
    (sum, inv) => sum + (inv.totalValue || 0),
    0
  );

  const totalInvestments = investments.length;

  // Pie chart per investment
  const getInvestmentPieData = (inv) => {
    const costBasis = inv.costBasis || 0;
    const currentValue = inv.totalValue || 0;
    const profit = currentValue - costBasis;

    return {
      labels: ["Cost Basis", "Profit"],
      datasets: [
        {
          label: `${inv.symbol} Profitability`,
          data: [costBasis, profit > 0 ? profit : 0],
          backgroundColor: ["#36A2EB", "#FF6384"],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  };

  // Bar chart per investment
  const getInvestmentBarData = (inv) => {
    const costBasis = inv.costBasis || 0;
    const currentValue = inv.totalValue || 0;
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

  // Portfolio-wide bar chart
  const getPortfolioBarData = () => {
    const totalCostBasis = investments.reduce(
      (sum, inv) => sum + (inv.costBasis || 0),
      0
    );

    const totalValue = investments.reduce(
      (sum, inv) => sum + (inv.totalValue || 0),
      0
    );

    const totalProfit = totalValue - totalCostBasis;

    return {
      labels: [
        "Total Cost Basis",
        "Total Current Value",
        "Total Profit",
      ],
      datasets: [
        {
          label: "Portfolio",
          data: [totalCostBasis, totalValue, totalProfit],
          backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
        },
      ],
    };
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src="/bg1.png" alt="background" className="w-full h-full object-cover" />
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

      {/* Floating Images */}
      <div className="absolute inset-0 z-10">
        <img src="/pic-1.png" alt="" className="absolute top-20 left-10 blur-sm animate-floatX" />
        <img src="/pic-1.png" alt="" className="absolute top-40 right-20 blur-sm animate-floatY delay-[2000ms]" />
        <img src="/pic-2.png" alt="" className="absolute bottom-10 left-10 blur-sm animate-floatDiagonal delay-[2000ms]" />
        <img src="/pic-2.png" alt="" className="absolute bottom-10 right-10 blur-sm animate-floatX delay-[2000ms]" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center min-h-screen p-10 space-y-10">

        {/* Welcome */}
        <div className="w-full p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <div className="flex justify-between gap-20">
            <div className="flex-1 p-8 rounded-2xl bg-white/10 border border-white/20 text-center">
              <h2 className="text-5xl font-extrabold text-white">Welcome</h2>
            </div>

            <div className="flex-1 p-8 rounded-2xl bg-white/10 border border-white/20 text-center">
              <p className="text-4xl font-bold text-white">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Investments */}
        <div className="w-full p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
          <h3 className="text-3xl font-bold mb-6 text-center">Investments</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto">
            {investments.map((inv, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/10 border border-white/20">
                <h4 className="text-2xl font-bold mb-2">
                  Investment {idx + 1}
                </h4>
                <p>{inv.customerName} — {inv.symbol}</p>
                <p>Qty: {inv.quantity}</p>
                <p>Price: {inv.currentPrice?.toFixed?.(2) ?? "0.00"}</p>
                <p>Total: {inv.totalValue?.toFixed?.(2) ?? "0.00"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="w-full p-8 rounded-3xl bg-white/10 border border-white/20">
          <div className="grid grid-cols-2 gap-10 text-white text-center">
            <div>
              <h3 className="text-2xl font-bold">Total Investments</h3>
              <p className="text-3xl mt-2">{totalInvestments}</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Portfolio Value</h3>
              <p className="text-3xl mt-2">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Portfolio Bar */}
        <div className="w-full p-8 rounded-3xl bg-white/10 border border-white/20 text-white">
          <h3 className="text-3xl font-bold mb-6 text-center">
            Portfolio Overview
          </h3>

          <div className="w-full h-64">
            <Bar
              data={getPortfolioBarData()}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* Pie Charts */}
        <div className="w-full p-8 rounded-3xl bg-white/10 border border-white/20 text-white">
          <h3 className="text-3xl font-bold mb-6 text-center">
            Investment Profitability Pie Charts
          </h3>

          <div className="flex gap-6 overflow-x-auto">
            {investments.map((inv, idx) => (
              <div key={idx} className="min-w-[250px] h-64 flex flex-col items-center justify-center">
                <h4 className="font-bold mb-2">{inv.symbol}</h4>
                <div className="w-48 h-48">
                  <Pie data={getInvestmentPieData(inv)} />
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

          <div className="flex gap-6 overflow-x-auto">
            {investments.map((inv, idx) => (
              <div key={idx} className="min-w-[300px] h-64 flex flex-col items-center">
                <h4 className="font-bold mb-2">{inv.symbol}</h4>
                <div className="w-full h-48">
                  <Bar
                    data={getInvestmentBarData(inv)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
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