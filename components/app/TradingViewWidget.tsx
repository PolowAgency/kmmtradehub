"use client";

import { useEffect, useRef, useState } from "react";

const SYMBOLS = [
  { label: "XAU/USD", value: "FX:XAUUSD" },
  { label: "EUR/USD", value: "FX:EURUSD" },
  { label: "GBP/USD", value: "FX:GBPUSD" },
  { label: "USD/JPY", value: "FX:USDJPY" },
  { label: "NASDAQ",  value: "NASDAQ:NDX" },
  { label: "BTC/USD", value: "BITSTAMP:BTCUSD" },
];

const INTERVALS = [
  { label: "1m",  value: "1" },
  { label: "5m",  value: "5" },
  { label: "10m", value: "10" },
  { label: "15m", value: "15" },
  { label: "1h",  value: "60" },
  { label: "4h",  value: "240" },
  { label: "1j",  value: "D" },
];

declare global {
  interface Window {
    TradingView: { widget: new (config: Record<string, unknown>) => void };
  }
}

export function TradingViewWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [symbol, setSymbol]     = useState("FX:XAUUSD");
  const [interval, setInterval] = useState("10");
  const widgetRef = useRef<string>("");

  useEffect(() => {
    const containerId = `tv_${Math.random().toString(36).slice(2)}`;
    widgetRef.current = containerId;

    if (containerRef.current) {
      containerRef.current.innerHTML = `<div id="${containerId}" class="w-full h-full"></div>`;
    }

    function init() {
      new window.TradingView.widget({
        container_id:      containerId,
        width:             "100%",
        height:            "100%",
        symbol,
        interval,
        timezone:          "Europe/Paris",
        theme:             "dark",
        style:             "1",
        locale:            "fr",
        toolbar_bg:        "#0F0F0F",
        backgroundColor:   "#0A0A0A",
        gridColor:         "rgba(255,255,255,0.03)",
        enable_publishing: false,
        hide_top_toolbar:  false,
        hide_legend:       false,
        save_image:        false,
        studies: [
          "MASimple@tv-basicstudies",
          "MAExp@tv-basicstudies",
          "RSI@tv-basicstudies",
          "MACD@tv-basicstudies",
        ],
        overrides: {
          "mainSeriesProperties.candleStyle.upColor":         "#22c55e",
          "mainSeriesProperties.candleStyle.downColor":       "#ef4444",
          "mainSeriesProperties.candleStyle.borderUpColor":   "#22c55e",
          "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
          "mainSeriesProperties.candleStyle.wickUpColor":     "#22c55e",
          "mainSeriesProperties.candleStyle.wickDownColor":   "#ef4444",
        },
      });
    }

    if (window.TradingView) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = init;
      document.head.appendChild(script);
    }
  }, [symbol, interval]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Symboles */}
        <div className="flex gap-1 flex-wrap">
          {SYMBOLS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSymbol(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                symbol === s.value
                  ? "bg-gold/15 border-gold/40 text-gold"
                  : "bg-surface-2 border-white/[0.07] text-muted hover:text-cream hover:border-white/[0.15]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-white/[0.08] hidden sm:block" />

        {/* Intervalles */}
        <div className="flex gap-1">
          {INTERVALS.map((iv) => (
            <button
              key={iv.value}
              onClick={() => setInterval(iv.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                interval === iv.value
                  ? "bg-gold/15 border-gold/40 text-gold"
                  : "bg-surface-2 border-white/[0.07] text-muted hover:text-cream hover:border-white/[0.15]"
              }`}
            >
              {iv.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div
        ref={containerRef}
        className="flex-1 rounded-2xl overflow-hidden border border-white/[0.06]"
        style={{ minHeight: 480 }}
      />
    </div>
  );
}
