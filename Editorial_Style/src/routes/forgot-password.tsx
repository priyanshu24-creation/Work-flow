import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Atelier Noir" },
      { name: "description", content: "Request a password reset link for your account." },
      { property: "og:title", content: "Reset Password — Atelier Noir" },
      { property: "og:description", content: "Request a password reset link." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-5 py-20 md:py-28">
        <h1 className="display-md">Reset password</h1>
        {sent ? (
          <div className="mt-8 border border-border p-6 text-sm leading-relaxed text-muted-foreground">
            If an account exists for {email}, a reset link will be sent. Password reset emails are
            delivered once the backend is connected.
          </div>
        ) : (
          <form
            className="mt-10 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <label className="block">
              <span className="eyebrow text-muted-foreground">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm outline-none focus:border-foreground"
              />
            </label>
            <button
              type="submit"
              className="eyebrow w-full bg-primary py-4 text-primary-foreground"
            >
              Send reset link
            </button>
          </form>
        )}
        <p className="mt-8 text-sm">
          <Link to="/login" className="link-underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </SiteLayout>
  );
}
