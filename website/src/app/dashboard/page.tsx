"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
export default function DashboardIndex() { useEffect(() => { async function route() { const { data: { user } } = await supabase.auth.getUser(); if (!user) return window.location.assign("/auth"); const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single(); window.location.assign(data?.role === "delivery" ? "/dashboard/delivery" : "/dashboard/customer"); } route(); }, []); return <main className="loading">Opening your dashboard...</main>; }