import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { getCategory, effectivePrice } from "@/data/catalog";
import { currency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useShop } from "@/store/shop-context";
import type { Product } from "@/lib/types";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { wishlist, toggleWishlist } = useShop();
  const saved = wishlist.includes(product.id);
  const category = getCategory(product.categoryId);
  const hover = product.images[1] ?? product.images[0];

  return (
    <article className="group relative">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block"
        aria-label={product.name}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          <img
            src={product.images[0]}
            alt={product.name}
            loading={index < 4 ? "eager" : "lazy"}
            width={1024}
            height={1280}
            className="h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-0"
          />
          <img
            src={hover}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-0 transition-[opacity,transform] duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
          />
          {product.salePrice ? (
            <span className="eyebrow absolute left-0 top-0 bg-primary px-3 py-1.5 text-primary-foreground">
              Sale
            </span>
          ) : null}
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={saved}
        className="absolute right-3 top-3 p-2 text-foreground/70 transition-colors hover:text-foreground"
      >
        <Heart className={cn("h-4 w-4", saved && "fill-current")} strokeWidth={1.4} />
      </button>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="link-underline text-sm tracking-tight"
          >
            {product.name}
          </Link>
          <p className="eyebrow mt-1 text-muted-foreground">{category?.name}</p>
        </div>
        <p className="whitespace-nowrap text-sm tabular-nums">
          {product.salePrice ? (
            <>
              <span className="mr-2 text-muted-foreground line-through">
                {currency(product.price, product.currency)}
              </span>
              {currency(product.salePrice, product.currency)}
            </>
          ) : (
            currency(effectivePrice(product), product.currency)
          )}
        </p>
      </div>
    </article>
  );
}
