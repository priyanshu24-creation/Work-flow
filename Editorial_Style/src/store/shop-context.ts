import { createContext, useContext } from "react";
import type { CartLine, Order } from "@/lib/types";

export interface Session {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

export interface ShopState {
  hydrated: boolean;
  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  addToCart: (line: Omit<CartLine, "lineId">) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  recentlyViewed: string[];
  markViewed: (productId: string) => void;
  session: Session | null;
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  lastOrder: Order | null;
  setLastOrder: (order: Order | null) => void;
}

export const ShopContext = createContext<ShopState | null>(null);

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
