import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginShell } from "@/components/auth/admin-login-shell";
import { getAdminSession } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export const metadata: Metadata = {
  title: "管理员登录",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  const { error } = await searchParams;

  return <AdminLoginShell error={Boolean(error)} siteName={siteConfig.name} />;
}
