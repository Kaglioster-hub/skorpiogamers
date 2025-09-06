"use client";
import Image from "next/image";

export type Deal = {
  title: string;
  salePrice: number;
  fullPrice: number;
  savings: number; // percentuale (es. 67.89)
  url: string;     // redirect CheapShark allo store
  thumb: string;   // header/cover
  store: string;   // "Steam", "GOG", ...
  slug: string;    // id univoco
};

export default function GameCard({ deal }: { deal: Deal }) {
  const pct = Math.round(deal.savings);
  const hasDiscount = pct > 0 && deal.fullPrice > deal.salePrice;

  return (
    <a
      href={deal.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Apri l'offerta di ${deal.title} su ${deal.store}`}
      className="card-glow block rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950/60 hover:border-cyan-500/40 hover:bg-neutral-900/40 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
      <div className="relative aspect-[16/9] bg-neutral-900">
        <Image
          src={deal.thumb}
          alt={deal.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          unoptimized
        />
        {hasDiscount && (
          <span className="absolute top-2 right-2 rounded-lg bg-cyan-400 text-black text-xs font-bold px-2 py-1 shadow">
            -{pct}%
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 font-semibold leading-snug">{deal.title}</h3>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-cyan-400">
              {deal.salePrice.toFixed(2)}€
            </span>
            {hasDiscount && (
              <span className="text-sm line-through text-neutral-500">
                {deal.fullPrice.toFixed(2)}€
              </span>
            )}
          </div>

          <span className="text-[11px] px-2 py-1 rounded-md bg-neutral-800 text-neutral-200">
            {deal.store}
          </span>
        </div>
      </div>
    </a>
  );
}
