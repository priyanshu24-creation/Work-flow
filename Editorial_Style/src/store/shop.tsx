import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine, Order } from "@/lib/types";
import { ShopContext, type Session, type ShopState } from "./shop-context";

/**
 * Client-side shop state (cart, wishlist, recently viewed, session, last order).
 * Persisted to localStorage today; every mutation is funnelled through this
 * provider so it can be pointed at server endpoints without touching the UI.
 */

const KEY = "atelier-noir-state";

interface Persisted {
  cart: CartLine[];
  wishlist: string[];
  recentlyViewed: string[];
  session: Session | null;
  lastOrder: Order | null;
}

const empty: Persisted = {
  cart: [],
  wishlist: [],
  recentlyViewed: [],
  session: null,
  lastOrder: null,
};

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(empty);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...empty, ...(JSON.parse(raw) as Partial<Persisted>) });
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const addToCart = useCallback((line: Omit<CartLine, "lineId">) => {
    setState((prev) => {
      const lineId = `${line.productId}:${line.color}:${line.size}`;
      const existing = prev.cart.find((l) => l.lineId === lineId);
      const cart = existing
        ? prev.cart.map((l) =>
            l.lineId === lineId
              ? {
                  ...l,
                  quantity: Math.min(l.quantity + line.quantity, l.maxQuantity),
                }
              : l,
          )
        : [...prev.cart, { ...line, lineId }];
      return { ...prev, cart };
    });
    setCartOpen(true);
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart
        .map((l) =>
          l.lineId === lineId
            ? { ...l, quantity: Math.max(0, Math.min(quantity, l.maxQuantity)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    }));
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setState((prev) => ({ ...prev, cart: prev.cart.filter((l) => l.lineId !== lineId) }));
  }, []);

  const clearCart = useCallback(() => setState((prev) => ({ ...prev, cart: [] })), []);

  const toggleWishlist = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      wishlist: prev.wishlist.includes(productId)
        ? prev.wishlist.filter((id) => id !== productId)
        : [...prev.wishlist, productId],
    }));
  }, []);

  const markViewed = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      recentlyViewed: [productId, ...prev.recentlyViewed.filter((id) => id !== productId)].slice(
        0,
        6,
      ),
    }));
  }, []);

  const signIn = useCallback((email: string, name?: string) => {
    setState((prev) => ({
      ...prev,
      session: {
        id: "usr_local",
        email,
        name: name ?? email.split("@")[0] ?? "Guest",
        role: email.startsWith("admin") ? "admin" : "customer",
      },
    }));
  }, []);

  const signOut = useCallback(() => setState((prev) => ({ ...prev, session: null })), []);

  const setLastOrder = useCallback(
    (order: Order | null) => setState((prev) => ({ ...prev, lastOrder: order })),
    [],
  );

  const value = useMemo<ShopState>(() => {
    const subtotal = state.cart.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    return {
      hydrated,
      cart: state.cart,
      cartCount: state.cart.reduce((s, l) => s + l.quantity, 0),
      subtotal,
      addToCart,
      updateQuantity,
      removeLine,
      clearCart,
      cartOpen,
      setCartOpen,
      wishlist: state.wishlist,
      toggleWishlist,
      recentlyViewed: state.recentlyViewed,
      markViewed,
      session: state.session,
      signIn,
      signOut,
      lastOrder: state.lastOrder,
      setLastOrder,
    };
  }, [
    state,
    hydrated,
    cartOpen,
    addToCart,
    updateQuantity,
    removeLine,
    clearCart,
    toggleWishlist,
    markViewed,
    signIn,
    signOut,
    setLastOrder,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
