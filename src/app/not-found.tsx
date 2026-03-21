import Link from "next/link";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-6 py-16 lg:px-10">
      <FadeIn className="w-full">
        <Card className="w-full rounded-3xl border-slate-200/80 bg-white/95 shadow-xl shadow-slate-200/70">
          <CardHeader>
            <CardTitle className="text-3xl">这篇文章不存在</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>可能是链接写错了，或者这篇文章还没有发布。</p>
            <Button asChild className="rounded-2xl">
              <Link href="/articles">返回文章列表</Link>
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    </main>
  );
}
