"use client";

import { useQuery } from "@tanstack/react-query";
import { seltraApi } from "@/lib/api";
import { seltraConfig } from "@/config/seltra.config";

const pair = seltraConfig.pairs[0];

/**
 * Hero terminal mock. Purely decorative by design, but when the API is up it
 * carries the real best quote, venue name, and 24h market change so the
 * "preview" shows the live market; static placeholder numbers otherwise.
 */
export function TerminalPreview() {
  const { data: quote } = useQuery({
    queryKey: ["seltra", "quote", pair.id],
    queryFn: () => seltraApi.getQuote(pair.id),
    retry: 1,
    refetchInterval: 30_000,
  });
  const { data: history } = useQuery({
    queryKey: ["seltra", "quote-history", pair.id],
    queryFn: () => seltraApi.getQuoteHistory(pair.id),
    retry: 1,
    refetchInterval: 60_000,
  });

  const price = quote?.price ?? 40.03;
  const venue = quote?.venue ?? "Best quote";
  const first = history?.[0]?.price;
  const change = quote && first ? ((quote.price - first) / first) * 100 : 2.14;
  const fmt = (value: number) => value.toFixed(pair.pricePrecision);

  return (
    <div className="landing-terminal" aria-label="Seltra terminal preview">
      <div className="landing-terminal-bar">
        <span className="terminal-pair">{pair.base} / {pair.quote}</span>
        <span className="preview-live"><i /> Terminal preview</span>
        <span className={`number ${change < 0 ? "sell" : "buy"}`}>
          {change < 0 ? "" : "+"}{change.toFixed(2)}%
        </span>
      </div>
      <div className="landing-terminal-body">
        <div className="preview-chart" aria-hidden="true">
          <div className="preview-grid" />
          <div className="preview-candles"><i /><i /><i /><i /><i /><i /><i /></div>
          <span className="preview-lfj"><b>{venue} ${fmt(price)}</b></span>
        </div>
        <div className="preview-book" aria-hidden="true">
          <span>RESTING BOOK</span>
          <b className="sell number">{fmt(price * 1.029)}</b>
          <b className="sell number">{fmt(price * 1.022)}</b>
          <b className="lfj-preview number">{fmt(price)}</b>
          <b className="buy number">{fmt(price * 0.995)}</b>
          <b className="buy number">{fmt(price * 0.987)}</b>
        </div>
        <div className="preview-ticket" aria-hidden="true">
          <span>LIMIT ORDER</span>
          <div className="preview-tabs"><b>Buy</b><b>Sell</b></div>
          <i>Amount</i>
          <i>Limit price</i>
          <strong className="number">10 {pair.base}</strong>
          <em>Connect wallet</em>
        </div>
      </div>
    </div>
  );
}
