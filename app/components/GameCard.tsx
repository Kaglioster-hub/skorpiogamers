"use client";
import { buildTracked } from "../lib/tracking";

export type Deal = {
  title: string;
  salePrice: number;
  fullPrice: number;
  savings: number; // %
  url: string;
  thumb: string | null;
  store: string;
  slug: string;
};

export default function GameCard({ deal }: { deal: Deal }) {
  const tracked = buildTracked(deal.url, deal.store, deal.slug);
  return (
    <div className="card-glow">
      <div className="card-media relative">
        {deal.thumb && <img src={deal.thumb} alt={deal.title} />}
        <span className="badge">{Math.round(deal.savings)}% OFF</span>
        <span className="badge-store">{deal.store}</span>
      </div>
      <div className="card-body">
        <h3 className="card-title" title={deal.title}>{deal.title}</h3>
        <div className="price">
          <span className="sale">€{deal.salePrice.toLocaleString("it-IT", {minimumFractionDigits: 2})}</span>
          <span className="normal">€{deal.fullPrice.toLocaleString("it-IT", {minimumFractionDigits: 2})}</span>
        </div>
        <a href={tracked} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          🚀 Vai allo Store
        </a>
      </div>
    </div>
  );
}
