import type { Metadata } from "next";
import Link from "next/link";

import { logoutAction } from "@/app/admin/actions";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "后台管理",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
      <FadeIn>
        <Card className="mb-8 rounded-[2rem] border-white/70 bg-white/88 shadow-xl shadow-slate-200/60 backdrop-blur">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6 lg:p-8">
            <div>
              <div className="text-sm font-medium text-slate-500">Admin Panel</div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">内容后台</h1>
              <p className="mt-1 text-sm text-slate-500">当前登录：{session.username}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href="/admin">文章管理</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href="/admin/articles/new">新建文章</Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" className="rounded-2xl shadow-sm">退出登录</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
      {children}
    </main>
  );
}
