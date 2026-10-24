"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
export default function DashboardIndex() { const router = useRouter(); useEffect(() => { async function route() { const { data: { user } } = await supabase.auth.getUser(); if (!user) return router.replace("/auth"); const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single(); router.replace(data?.role === "delivery" ? "/dashboard/delivery" : "/dashboard/customer"); } route(); }, [router]); return <main className="loading">Opening your dashboard...</main>; }