"use client";

import Link from "next/link";
import { Heart, MessageCircle, TimerReset } from "lucide-react";

import { HoverCardMotion } from "@/components/motion/hover-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatReadTime, getInitials } from "@/lib/content";

export type ArticleCardItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  publishedAt: Date;
  readTimeMinutes: number;
  commentCount: number;
  likeCount: number;
};

export function ArticleCard({ article }: { article: ArticleCardItem }) {
  return (
    <HoverCardMotion>
      <Card className="group h-full overflow-hidden rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm ring-1 ring-white/70 transition hover:shadow-2xl hover:shadow-slate-200/80">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-0 transition group-hover:opacity-100" />
        <CardHeader className="gap-4">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {article.category}
            </Badge>
            <span className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</span>
          </div>
          <CardTitle className="text-xl leading-8 tracking-tight text-slate-950">
            <Link href={`/articles/${article.slug}`} className="transition hover:text-primary">
              {article.title}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-7 text-muted-foreground">
          <p className="line-clamp-3">{article.excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Avatar className="h-9 w-9 border border-border bg-white">
              <AvatarFallback>{getInitials(article.authorName) || "AU"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-foreground">{article.authorName}</div>
              <div>{formatReadTime(article.readTimeMinutes)}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-auto flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">
            <Heart className="h-4 w-4" />
            {article.likeCount}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
            <MessageCircle className="h-4 w-4" />
            {article.commentCount}
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-slate-500">
            <TimerReset className="h-4 w-4" />
            {article.readTimeMinutes} min
          </span>
        </CardFooter>
      </Card>
    </HoverCardMotion>
  );
}
