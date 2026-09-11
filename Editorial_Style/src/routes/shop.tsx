import { createFileRoute } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { categories, effectivePrice, listProducts } from "@/data/catalog";
import { currency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ShopSearch {
  category?: string | undefined;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All — Atelier Noir" },
      {
        name: "description",
        content:
          "Browse the full Atelier Noir catalogue: outerwear, knitwear, tops and tailoring, filterable by size, colour and price.",
      },
      { property: "og:title", content: "Shop All — Atelier Noir" },
      {
        property: "og:description",
        content: "Outerwear, knitwear and tailoring in natural fibres.",
      },
    ],
  }),
  component: Shop,
});

type Sort = "featured" | "newest" | "price-asc" | "price-desc";

const SIZES = ["XS", "S", "M", "L", "XL"];

function Shop() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const all = listProducts();

  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sort, setSort] = useState<Sort>("featured");
  const [panelOpen, setPanelOpen] = useState(false);

  const colorOptions = useMemo(
    () => Array.from(new Set(all.flatMap((p) => p.colors.map((c) => c.name)))).sort(),
    [all],
  );

  const toggle = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const results = useMemo(() => {
    const activeCategory = categories.find((c) => c.slug === category);
    let out = all.filter((p) => {
      if (activeCategory && p.categoryId !== activeCategory.id) return false;
      if (effectivePrice(p) > maxPrice) return false;
      if (sizes.length && !p.sizes.some((s) => sizes.includes(s))) return false;
      if (colors.length && !p.colors.some((c) => colors.includes(c.name))) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "price-asc") return effectivePrice(a) - effectivePrice(b);
      if (sort === "price-desc") return effectivePrice(b) - effectivePrice(a);
      return Number(b.featured) - Number(a.featured);
    });
    return out;
  }, [all, category, maxPrice, sizes, colors, sort]);

  const clear = () => {
    setSizes([]);
    setColors([]);
    setMaxPrice(1000);
    void navigate({ search: {} });
  };

  const filters = (
    <div className="space-y-10">
      <div>
        <p className="eyebrow text-muted-foreground">Category</p>
        <ul className="mt-4 space-y-2">
          <li>
            <button
              type="button"
              onClick={() => void navigate({ search: {} })}
              className={cn("text-sm", !category ? "underline" : "text-muted-foreground")}
            >
              All pieces
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => void navigate({ search: { category: c.slug } })}
                className={cn(
                  "text-sm",
                  category === c.slug ? "underline" : "text-muted-foreground",
                )}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow text-muted-foreground">Size</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(sizes, s, setSizes)}
              className={cn(
                "border px-4 py-2 text-xs transition-colors",
                sizes.includes(s)
                  ? "border-foreground bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow text-muted-foreground">Colour</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {colorOptions.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggle(colors, c, setColors)}
              className={cn(
                "border px-4 py-2 text-xs transition-colors",
                colors.includes(c)
                  ? "border-foreground bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow text-muted-foreground">Max price</p>
        <input
          type="range"
          min={100}
          max={1000}
          step={10}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-5 w-full accent-[var(--ink)]"
          aria-label="Maximum price"
        />
        <p className="mt-2 text-sm tabular-nums">Up to {currency(maxPrice)}</p>
      </div>

      <button type="button" onClick={clear} className="eyebrow link-underline">
        Clear filters
      </button>
    </div>
  );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-12 md:px-10 md:pt-20">
        <header className="border-b border-border pb-8">
          <p className="eyebrow text-muted-foreground">
            {categories.find((c) => c.slug === category)?.name ?? "All pieces"}
          </p>
          <h1 className="display-lg mt-4">Shop</h1>
        </header>

        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="eyebrow flex items-center gap-2 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.3} /> Filters
          </button>
          <p className="eyebrow hidden text-muted-foreground lg:block">
            {results.length} {results.length === 1 ? "piece" : "pieces"}
          </p>
          <label className="eyebrow flex items-center gap-3">
            <span className="text-muted-foreground">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="border-b border-foreground bg-transparent py-1 text-xs uppercase tracking-[0.18em] outline-none"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">{filters}</aside>

          <div>
            {results.length === 0 ? (
              <div className="border border-border px-8 py-24 text-center">
                <p className="display-md">No pieces match</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Try widening the price range or clearing a filter.
                </p>
                <button type="button" onClick={clear} className="eyebrow link-underline mt-6">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 xl:grid-cols-4">
                {results.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 4) * 60}>
                    <ProductCard product={p} index={i} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div className={cn("fixed inset-0 z-[80] lg:hidden", panelOpen ? "" : "pointer-events-none")}>
        <div
          onClick={() => setPanelOpen(false)}
          className={cn(
            "absolute inset-0 bg-foreground/30 transition-opacity duration-400",
            panelOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-[86%] max-w-sm overflow-y-auto bg-background px-6 py-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            panelOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between pb-8">
            <span className="eyebrow">Filters</span>
            <button type="button" onClick={() => setPanelOpen(false)} aria-label="Close filters">
              <X className="h-5 w-5" strokeWidth={1.2} />
            </button>
          </div>
          {filters}
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="eyebrow mt-10 w-full bg-primary py-4 text-primary-foreground"
          >
            Show {results.length} results
          </button>
        </div>
      </div>
    </SiteLayout>
  );
}
