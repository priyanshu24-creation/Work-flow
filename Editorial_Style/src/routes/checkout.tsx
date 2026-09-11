import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { currency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  PAYMENT_PROVIDER,
  confirmPayment,
  createDraftOrder,
  createPaymentIntent,
} from "@/lib/payments";
import { useShop } from "@/store/shop-context";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Atelier Noir" },
      { name: "description", content: "Securely complete your Atelier Noir order." },
      { property: "og:title", content: "Checkout — Atelier Noir" },
      { property: "og:description", content: "Securely complete your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const STEPS = ["Information", "Shipping", "Payment"] as const;

interface Form {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

const initialForm: Form = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}

function Checkout() {
  const { cart, subtotal, clearCart, setLastOrder, hydrated } = useShop();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initialForm);
  const [busy, setBusy] = useState(false);

  const shipping = subtotal > 0 && subtotal < 300 ? 20 : 0;
  const total = subtotal + shipping;
  const set = (key: keyof Form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const placeOrder = async () => {
    setBusy(true);
    try {
      const order = await createDraftOrder({
        email: form.email,
        phone: form.phone,
        address: {
          id: "adr_checkout",
          label: "Shipping",
          fullName: form.fullName,
          phone: form.phone,
          line1: form.line1,
          city: form.city,
          state: form.state,
          country: form.country,
          postalCode: form.postalCode,
          isDefault: true,
        },
        lines: cart,
        subtotal,
        shipping,
        discount: 0,
      });
      await createPaymentIntent(order);
      const result = await confirmPayment(order);
      setLastOrder(result.order);
      clearCart();
      toast.message(result.message);
      void navigate({ to: "/order-confirmation" });
    } catch {
      toast.error("We couldn't place the order. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (hydrated && cart.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-5 py-28 text-center">
          <h1 className="display-md">Nothing to check out</h1>
          <p className="mt-3 text-sm text-muted-foreground">Add a piece to your bag to continue.</p>
          <Link
            to="/shop"
            className="eyebrow mt-8 inline-block bg-primary px-10 py-4 text-primary-foreground"
          >
            Shop the collection
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
        <h1 className="display-lg">Checkout</h1>

        <ol className="mt-8 flex gap-6 border-b border-border pb-5">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={cn(
                "eyebrow transition-colors",
                i === step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {String(i + 1).padStart(2, "0")} {s}
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 2) setStep(step + 1);
              else void placeOrder();
            }}
            className="space-y-8"
          >
            {step === 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Full name" value={form.fullName} onChange={set("fullName")} />
                <Field label="Email" type="email" value={form.email} onChange={set("email")} />
                <Field label="Phone" type="tel" value={form.phone} onChange={set("phone")} />
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Address" value={form.line1} onChange={set("line1")} />
                </div>
                <Field label="City" value={form.city} onChange={set("city")} />
                <Field label="State" value={form.state} onChange={set("state")} />
                <Field label="Country" value={form.country} onChange={set("country")} />
                <Field
                  label="Postal / PIN code"
                  value={form.postalCode}
                  onChange={set("postalCode")}
                />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <div className="border border-border p-6">
                  <p className="eyebrow">Payment</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    This store is wired for{" "}
                    <span className="text-foreground uppercase">{PAYMENT_PROVIDER}</span>. Your
                    order is created and held as <em>awaiting payment</em>; it is only marked paid
                    once the gateway webhook is verified on the server. No card details are handled
                    by this page.
                  </p>
                </div>
                <div className="border border-border p-6 text-sm">
                  <p className="eyebrow text-muted-foreground">Delivering to</p>
                  <p className="mt-3">
                    {form.fullName}, {form.line1}, {form.city} {form.postalCode}, {form.state},{" "}
                    {form.country}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-6 pt-4">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="eyebrow link-underline"
                >
                  Back
                </button>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="eyebrow bg-primary px-10 py-4 text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {busy ? "Placing order…" : step < 2 ? "Continue" : "Place order"}
              </button>
            </div>
          </form>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="eyebrow">Order summary</h2>
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {cart.map((l) => (
                <li key={l.lineId} className="flex gap-4 py-4">
                  <img src={l.image} alt="" loading="lazy" className="h-24 w-20 object-cover" />
                  <div className="flex-1 text-sm">
                    <p>{l.name}</p>
                    <p className="eyebrow mt-1 text-muted-foreground">
                      {l.color} / {l.size} · {l.quantity}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums">{currency(l.unitPrice * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{currency(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums">{shipping ? currency(shipping) : "Free"}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-4 text-base">
                <dt>Total</dt>
                <dd className="tabular-nums">{currency(total)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
