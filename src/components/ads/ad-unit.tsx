"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdUnitProps = {
  slot: string;
  className?: string;
  label?: string;
  minHeight?: number;
};

const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;

export function AdUnit({ slot, className, label = "广告", minHeight = 140 }: AdUnitProps) {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!client || !slot || pushedRef.current) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // noop
    }
  }, [slot]);

  if (!client || !slot) {
    return null;
  }

  return (
    <div className={cn("overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-sm", className)}>
      <div className="border-b border-slate-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="px-4 py-4">
        <ins
          className="adsbygoogle block w-full overflow-hidden"
          style={{ display: "block", minHeight }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
