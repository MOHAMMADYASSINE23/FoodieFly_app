import AuthForm from "@/components/auth-form";

type Role = "customer" | "delivery";

function safeLocalPath(value?: string): string | null {
  if (!value) return null;
  try {
    const base = "https://foodiefly.invalid";
    const target = new URL(value, base);
    if (target.origin !== base) return null;
    return target.pathname + target.search + target.hash;
  } catch {
    return null;
  }
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; next?: string }>;
}) {
  const params = await searchParams;
  const initialRole: Role = params.role === "delivery" ? "delivery" : "customer";
  const returnTo = safeLocalPath(params.next) ?? "/dashboard/customer";

  return <AuthForm initialRole={initialRole} returnTo={returnTo} />;
}
