import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type FilterState = {
  q: string;
  category: string;
  tag: string;
};

type FilterTag = {
  slug: string;
  name: string;
  count: number;
};

function buildHref(nextState: Partial<FilterState>, currentState: FilterState) {
  const params = new URLSearchParams();
  const merged = { ...currentState, ...nextState };

  if (merged.q) params.set("q", merged.q);
  if (merged.category) params.set("category", merged.category);
  if (merged.tag) params.set("tag", merged.tag);

  const query = params.toString();
  return query ? `/articles?${query}` : "/articles";
}

export function ArticleFilters({
  state,
  categories,
  tags,
  resultCount,
}: {
  state: FilterState;
  categories: string[];
  tags: FilterTag[];
  resultCount: number;
}) {
  const hasActiveFilters = Boolean(state.q || state.category || state.tag);

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-white/70 bg-white/88 p-5 shadow-lg shadow-slate-200/60 backdrop-blur">
        <form action="/articles" className="flex flex-col gap-3 lg:flex-row">
          <Input name="q" defaultValue={state.q} placeholder="搜索标题、摘要、正文或作者……" className="h-11 rounded-2xl border-white/60 bg-white/90 shadow-sm" />
          {state.category ? <input type="hidden" name="category" value={state.category} /> : null}
          {state.tag ? <input type="hidden" name="tag" value={state.tag} /> : null}
          <Button type="submit" className="h-11 rounded-2xl px-5 shadow-sm">
            搜索文章
          </Button>
          {hasActiveFilters ? (
            <Button asChild type="button" variant="outline" className="h-11 rounded-2xl border-white/60 bg-white/80 px-5 shadow-sm">
              <Link href="/articles">清空筛选</Link>
            </Button>
          ) : null}
        </form>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/88 p-5 shadow-lg shadow-slate-200/60 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-slate-500">分类筛选</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">按分类浏览</div>
            </div>
            <Badge variant="secondary" className="rounded-full px-3 py-1.5">
              {resultCount} 篇结果
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant={state.category ? "outline" : "secondary"} className="rounded-full px-4">
              <Link href={buildHref({ category: "" }, state)}>全部</Link>
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                asChild
                variant={state.category === category ? "secondary" : "outline"}
                className="rounded-full px-4"
              >
                <Link href={buildHref({ category }, state)}>{category}</Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/88 p-5 shadow-lg shadow-slate-200/60 backdrop-blur">
          <div className="text-sm font-medium text-slate-500">标签筛选</div>
          <div className="mt-1 text-lg font-semibold text-slate-950">按标签聚合</div>
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Button
                key={tag.slug}
                asChild
                variant={state.tag === tag.slug ? "default" : "outline"}
                className="rounded-full px-4"
              >
                <Link href={buildHref({ tag: state.tag === tag.slug ? "" : tag.slug }, state)}>
                  #{tag.name}
                  <span className="ml-1 opacity-70">{tag.count}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
