import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import {
  categories,
  effectivePrice,
  getCategory,
  listProducts,
  sampleCoupons,
  sampleCustomers,
  sampleOrders,
  totalStock,
} from "@/data/catalog";
import { currency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useShop } from "@/store/shop-context";
import type { OrderStatus, Product } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Atelier Noir" },
      { name: "description", content: "Internal dashboard for Atelier Noir." },
      { property: "og:title", content: "Admin — Atelier Noir" },
      { property: "og:description", content: "Internal dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

const SECTIONS = [
  "Dashboard",
  "Products",
  "Orders",
  "Customers",
  "Categories",
  "Coupons",
  "Content",
] as const;
type Section = (typeof SECTIONS)[number];

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function Admin() {
  const { session, hydrated } = useShop();
  const [section, setSection] = useState<Section>("Dashboard");
  const [orderQuery, setOrderQuery] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>(
    Object.fromEntries(sampleOrders.map((o) => [o.id, o.status])),
  );
  const [drafts, setDrafts] = useState<Product[]>(listProducts());
  const [editing, setEditing] = useState<Product | null>(null);

  const revenue = sampleOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + o.total, 0);

  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    return sampleOrders.filter(
      (o) =>
        !q ||
        o.number.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q),
    );
  }, [orderQuery]);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    return sampleCustomers.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [customerQuery]);

  if (!hydrated) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-[1600px] px-5 py-24 md:px-10">
          <div className="h-10 w-56 animate-pulse bg-secondary" />
        </div>
      </SiteLayout>
    );
  }

  if (session?.role !== "admin") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-5 py-28 text-center">
          <h1 className="display-md">Restricted</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The dashboard is for staff accounts. Sign in with an email starting with “admin” to
            preview it — real role checks are enforced on the server once the backend is connected.
          </p>
          <Link
            to="/login"
            className="eyebrow mt-8 inline-block bg-primary px-10 py-4 text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const stat = (label: string, value: string) => (
    <div key={label} className="border border-border p-6">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="font-display mt-4 text-3xl tabular-nums">{value}</p>
    </div>
  );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-16">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow text-muted-foreground">Atelier Noir</p>
            <h1 className="display-md mt-3">Admin</h1>
          </div>
          <p className="eyebrow text-muted-foreground">{session.email}</p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[180px_1fr] lg:gap-16">
          <nav className="flex gap-6 overflow-x-auto lg:flex-col lg:gap-3">
            {SECTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                className={cn(
                  "eyebrow whitespace-nowrap text-left",
                  section === s ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </nav>

          <div>
            {section === "Dashboard" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stat("Revenue", currency(revenue))}
                  {stat("Orders", String(sampleOrders.length))}
                  {stat("Customers", String(sampleCustomers.length))}
                  {stat("Products", String(drafts.length))}
                </div>
                <h2 className="eyebrow mt-14">Recent orders</h2>
                <ul className="mt-4 divide-y divide-border border-y border-border text-sm">
                  {sampleOrders.map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p>{o.number}</p>
                        <p className="eyebrow mt-1 text-muted-foreground">
                          {o.customerName} · {formatDate(o.createdAt)}
                        </p>
                      </div>
                      <span className="tabular-nums">{currency(o.total)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {section === "Products" ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="eyebrow">{drafts.length} products</h2>
                  <button
                    type="button"
                    onClick={() =>
                      toast.message("New product form opens once the backend is connected")
                    }
                    className="eyebrow bg-primary px-6 py-3 text-primary-foreground"
                  >
                    + New product
                  </button>
                </div>
                <div className="mt-6 overflow-x-auto border border-border">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="border-b border-border">
                      <tr className="eyebrow text-left text-muted-foreground">
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {drafts.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={p.images[0]} alt="" className="h-12 w-10 object-cover" />
                              <span>{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {getCategory(p.categoryId)?.name}
                          </td>
                          <td className="px-4 py-3 tabular-nums">{currency(effectivePrice(p))}</td>
                          <td className="px-4 py-3 tabular-nums">{totalStock(p)}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                setDrafts((list) =>
                                  list.map((d) =>
                                    d.id === p.id ? { ...d, published: !d.published } : d,
                                  ),
                                )
                              }
                              className="eyebrow border border-border px-3 py-1.5"
                            >
                              {p.published ? "Published" : "Draft"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setEditing(p)}
                              className="eyebrow link-underline"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {editing ? (
                  <div className="mt-8 border border-border p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="eyebrow">Editing — {editing.name}</h3>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="eyebrow text-muted-foreground"
                      >
                        Close
                      </button>
                    </div>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                      {[
                        ["Name", editing.name],
                        ["SKU prefix", editing.variants[0]?.sku ?? "—"],
                        ["Price", String(editing.price)],
                        ["Sale price", editing.salePrice ? String(editing.salePrice) : ""],
                        ["Sizes", editing.sizes.join(", ")],
                        ["Colours", editing.colors.map((c) => c.name).join(", ")],
                      ].map(([label, value]) => (
                        <label key={label} className="block">
                          <span className="eyebrow text-muted-foreground">{label}</span>
                          <input
                            defaultValue={value}
                            className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
                          />
                        </label>
                      ))}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          toast.success("Changes staged — saving needs the backend");
                          setEditing(null);
                        }}
                        className="eyebrow bg-primary px-8 py-3 text-primary-foreground"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.message("Image upload needs storage connected")}
                        className="eyebrow border border-border px-8 py-3"
                      >
                        Upload images
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDrafts((l) => l.filter((d) => d.id !== editing.id));
                          setEditing(null);
                          toast.success("Product removed from this session");
                        }}
                        className="eyebrow border border-destructive px-8 py-3 text-destructive"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            {section === "Orders" ? (
              <>
                <input
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="Search by order number, name or email"
                  className="w-full max-w-md border-b border-border bg-transparent py-3 text-sm outline-none focus:border-foreground"
                />
                <ul className="mt-8 divide-y divide-border border-y border-border">
                  {filteredOrders.map((o) => (
                    <li
                      key={o.id}
                      className="grid gap-4 py-6 lg:grid-cols-[1fr_auto] lg:items-center"
                    >
                      <div className="text-sm">
                        <p>
                          {o.number} — {o.customerName}
                        </p>
                        <p className="eyebrow mt-2 text-muted-foreground">
                          {o.customerEmail} · {formatDate(o.createdAt)} · payment{" "}
                          {o.paymentStatus.replace("_", " ")}
                          {o.paymentReference ? ` · ${o.paymentReference}` : ""}
                        </p>
                        <p className="mt-2 text-muted-foreground">
                          {o.items
                            .map((i) => `${i.quantity}× ${i.name} (${i.color}/${i.size})`)
                            .join(", ")}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="tabular-nums">{currency(o.total)}</span>
                        <select
                          value={statuses[o.id] ?? o.status}
                          onChange={(e) => {
                            setStatuses((s) => ({
                              ...s,
                              [o.id]: e.target.value as OrderStatus,
                            }));
                            toast.success(`${o.number} set to ${e.target.value}`);
                          }}
                          className="eyebrow border border-border px-3 py-2"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => toast.message("Refunds are issued through the gateway")}
                          className="eyebrow link-underline text-muted-foreground"
                        >
                          Refund
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {section === "Customers" ? (
              <>
                <input
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                  placeholder="Search customers"
                  className="w-full max-w-md border-b border-border bg-transparent py-3 text-sm outline-none focus:border-foreground"
                />
                <ul className="mt-8 divide-y divide-border border-y border-border text-sm">
                  {filteredCustomers.map((c) => (
                    <li key={c.id} className="flex flex-wrap justify-between gap-4 py-5">
                      <div>
                        <p>{c.name}</p>
                        <p className="eyebrow mt-1 text-muted-foreground">
                          {c.email} · joined {formatDate(c.joinedAt)}
                        </p>
                      </div>
                      <p className="text-muted-foreground">
                        {c.orders} orders · {currency(c.spend)} lifetime
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {section === "Categories" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {categories.map((c) => (
                  <div key={c.id} className="border border-border p-6">
                    <p className="tracking-tight">{c.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
                    <div className="mt-6 flex gap-4">
                      <button type="button" className="eyebrow link-underline">
                        Edit
                      </button>
                      <button
                        type="button"
                        className="eyebrow link-underline text-muted-foreground"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => toast.message("Category creation needs the backend")}
                  className="eyebrow border border-dashed border-border p-6 text-muted-foreground"
                >
                  + New category
                </button>
              </div>
            ) : null}

            {section === "Coupons" ? (
              <div className="overflow-x-auto border border-border">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="border-b border-border">
                    <tr className="eyebrow text-left text-muted-foreground">
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Discount</th>
                      <th className="px-4 py-3">Expires</th>
                      <th className="px-4 py-3">Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sampleCoupons.map((c) => (
                      <tr key={c.id}>
                        <td className="px-4 py-3">{c.code}</td>
                        <td className="px-4 py-3">
                          {c.type === "percent" ? `${c.value}%` : currency(c.value)}
                        </td>
                        <td className="px-4 py-3">{formatDate(c.expiresAt)}</td>
                        <td className="px-4 py-3 tabular-nums">
                          {c.used} / {c.usageLimit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {section === "Content" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Homepage hero", "Weight, drape, silence — AW26 campaign"],
                  ["Featured collection", "The winter overcoat study"],
                  ["Lookbook", "3 spreads published"],
                  ["Promotional band", "Free shipping above $300"],
                ].map(([title, value]) => (
                  <div key={title} className="border border-border p-6">
                    <p className="eyebrow text-muted-foreground">{title}</p>
                    <p className="mt-3 text-sm">{value}</p>
                    <button type="button" className="eyebrow link-underline mt-6">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
