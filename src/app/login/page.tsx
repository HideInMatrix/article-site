import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminSession } from "@/lib/auth";
import { loginAction } from "@/app/admin/actions";

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

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-16 lg:px-10">
      <FadeIn className="w-full">
        <Card className="w-full rounded-[2rem] border-white/70 bg-white/88 shadow-2xl shadow-slate-200/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-3xl">管理员登录</CardTitle>
            <CardDescription>
              这是最简单的本地后台登录。默认开发账号可参考项目里的 <code>.env.example</code>。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {error ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                用户名或密码不正确。
              </div>
            ) : null}
            <form action={loginAction} className="space-y-4">
              <Input name="username" placeholder="用户名" required />
              <Input name="password" type="password" placeholder="密码" required />
              <Button type="submit" className="w-full rounded-2xl shadow-sm">
                登录后台
              </Button>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </main>
  );
}
