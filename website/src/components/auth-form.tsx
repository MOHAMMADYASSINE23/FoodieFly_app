"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Role = "customer" | "delivery";
type AuthMode = "signin" | "signup";

const roleName = (role: Role) => role === "delivery" ? "Delivery driver" : "Customer";

function safeLocalPath(value: string | null): string | null {
  if (!value) return null;
  try {
    const target = new URL(value, window.location.origin);
    if (target.origin !== window.location.origin) return null;
    return target.pathname + target.search + target.hash;
  } catch {
    return null;
  }
}

export default function AuthForm({ initialRole, returnTo }: { initialRole: Role; returnTo: string }) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [role, setRole] = useState<Role>(initialRole);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    try {
      if (mode === "signup") {
        // Public signup can only create customer accounts. Delivery roles are
        // assigned separately by a trusted administrator in Supabase.
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: String(form.get("name") ?? "").trim() },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;

        if (data.session) {
          window.location.assign("/dashboard/customer");
          return;
        }

        setMessage("Account created. Check your email to confirm it, then sign in as a customer.");
        setMode("signin");
        setRole("customer");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Your session could not be verified. Please sign in again.");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          await supabase.auth.signOut();
          throw new Error("Your FoodieFly profile could not be found.");
        }

        if (profile.role !== role) {
          await supabase.auth.signOut();
          throw new Error(
            `This is a ${profile.role === "delivery" ? "delivery driver" : "customer"} account. Please choose ${roleName(profile.role as Role)} before signing in.`,
          );
        }

        const roleHome = role === "delivery" ? "/dashboard/delivery" : "/dashboard/customer";
        const destination = role === "customer" ? safeLocalPath(returnTo) ?? roleHome : roleHome;
        window.location.assign(destination);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not authenticate. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <Link className="brand" href="/"><i>F</i>oodieFly</Link>
      <section className="authCard">
        <p className="eyebrow">WELCOME TO FOODIEFLY</p>
        <h1>{mode === "signin" ? "Welcome back." : "Create your account."}</h1>
        <p className="authIntro">
          {mode === "signin"
            ? "Choose your account type to open the right dashboard."
            : "Create a customer account to order from local stores. Delivery-driver accounts are provisioned by a FoodieFly administrator."}
        </p>

        {mode === "signin" && (
          <div className="rolePicker">
            <button type="button" className={role === "customer" ? "chosen" : ""} onClick={() => setRole("customer")}>
              <b>Customer</b>
              <small>Order from local stores and track deliveries</small>
            </button>
            <button type="button" className={role === "delivery" ? "chosen" : ""} onClick={() => setRole("delivery")}>
              <b>Delivery driver</b>
              <small>Accept and manage assigned delivery orders</small>
            </button>
          </div>
        )}

        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>Full name<input required name="name" maxLength={100} autoComplete="name" placeholder="Your full name" /></label>
          )}
          <label>Email<input required type="email" name="email" maxLength={254} autoComplete="email" placeholder="you@example.com" /></label>
          <label>Password<input required minLength={8} type="password" name="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="At least 8 characters" /></label>
          {message && <p className="authError" role="alert">{message}</p>}
          <button className="primary authSubmit" disabled={loading}>
            {loading ? "Please wait..." : mode === "signin" ? `Sign in as ${roleName(role)}` : "Create customer account"}
          </button>
        </form>

        <p className="switch">
          {mode === "signin" ? "New to FoodieFly?" : "Already have an account?"}
          {" "}
          <button type="button" onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMessage("");
          }}>
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </section>
    </main>
  );
}
