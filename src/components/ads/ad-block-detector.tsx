"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdBlockDetector() {
  const pathname = usePathname();
  const promptedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      let adBlockDetected = false;

      try {
        const response = await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        });

        if (response.redirected) {
          adBlockDetected = true;
        }
      } catch {
        adBlockDetected = true;
      }

      const adsTags = document.querySelectorAll('ins.adsbygoogle-custom:not([data-ad-initialized])');
      for (const node of adsTags) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          node.setAttribute("data-ad-initialized", "true");
        } catch {
          // noop
        }
      }

      if (cancelled || promptedRef.current) {
        return;
      }

      if (adBlockDetected) {
        promptedRef.current = true;
        window.confirm("我们的网站依赖广告收入，请关闭广告拦截插件，支持我们！点击确认或取消都将刷新页面。");
        window.location.reload();
        return;
      }

      setTimeout(() => {
        if (cancelled || promptedRef.current) {
          return;
        }

        const blockedAds = document.querySelectorAll("ins.adsbygoogle-custom");
        for (const ad of blockedAds) {
          if ((ad as HTMLElement).clientHeight === 0) {
            promptedRef.current = true;
            window.confirm("我们的网站依赖广告收入，请关闭广告拦截插件，支持我们！点击确认或取消都将刷新页面。");
            window.location.reload();
            break;
          }
        }
      }, 1200);
    }

    const timeout = window.setTimeout(run, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [pathname]);

  return null;
}
