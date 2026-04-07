"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Eye, EyeOff, Shield } from "lucide-react";

import { loginAction } from "@/app/admin/actions";
import { AnimatedCharacters } from "@/components/ui/animated-characters";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AdminLoginShellProps = {
  error?: boolean;
  siteName: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "group relative h-12 w-full overflow-hidden rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-900 shadow-sm transition-all duration-300",
        "hover:border-slate-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <span className="inline-flex items-center gap-2 transition-all duration-300 group-hover:-translate-y-8 group-hover:opacity-0">
        {pending ? "登录中..." : "登录后台"}
      </span>
      <span className="absolute inset-0 flex items-center justify-center gap-2 rounded-full bg-slate-950 text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
        {pending ? "登录中..." : "登录后台"}
        <ArrowRight className="size-4" />
      </span>
    </button>
  );
}

export function AdminLoginShell({ error = false, siteName }: AdminLoginShellProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:bg-[linear-gradient(135deg,#94a3b8_0%,#64748b_45%,#334155_100%)] lg:p-12 lg:text-white">
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/14 text-white ring-1 ring-white/20 backdrop-blur-sm">
              <Shield className="size-5" />
            </div>
            <div>
              <p className="text-sm text-white/70">Admin Access</p>
              <h1 className="text-lg font-semibold tracking-tight">{siteName}</h1>
            </div>
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center px-4 pb-8 pt-12">
            <div className="max-w-xl space-y-5">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/65">Secure portal</p>
              <h2 className="max-w-lg text-5xl leading-[1.05] font-bold tracking-tight text-white">
                管理后台登录，换成和参考页同一套视觉语言。
              </h2>
              <p className="max-w-md text-base leading-7 text-white/72">
                左侧保留 AnimatedCharacters 交互，右侧维持你现有的本地账号密码登录逻辑，只重做界面与体验层。
              </p>
            </div>

            <div className="mt-10 flex justify-center lg:mt-14 lg:justify-start">
              <AnimatedCharacters
                isTyping={isTyping}
                showPassword={showPassword}
                passwordLength={password.length}
              />
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-6 text-sm text-white/70">
            <Link href="/" className="transition-colors hover:text-white">
              返回首页
            </Link>
            <Link href="/articles" className="transition-colors hover:text-white">
              浏览文章
            </Link>
          </div>

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:22px_22px] opacity-30" />
            <div className="absolute right-[10%] top-[18%] size-72 rounded-full bg-white/12 blur-3xl" />
            <div className="absolute bottom-[12%] left-[8%] size-96 rounded-full bg-indigo-300/18 blur-3xl" />
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-[440px]">
            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <Shield className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Admin Access</p>
                <h1 className="text-base font-semibold text-slate-950">{siteName}</h1>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-white/88 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10">
              <div className="mb-8 space-y-3 text-center sm:text-left">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Welcome back</p>
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">管理员登录</h2>
                <p className="text-sm leading-6 text-slate-500">
                  登录后进入后台管理。开发环境默认账号仍以项目里的 <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px] text-slate-700">.env.example</code> 为准。
                </p>
              </div>

              {error ? (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  用户名或密码不正确，请重新输入。
                </div>
              ) : null}

              <form action={loginAction} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                    用户名
                  </label>
                  <Input
                    id="username"
                    name="username"
                    required
                    placeholder="admin"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    className="h-12 rounded-2xl border-slate-200 bg-white px-4 text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-slate-900 focus-visible:ring-1 focus-visible:ring-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      密码
                    </label>
                    <span className="text-xs text-slate-400">本地后台认证</span>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      className="h-12 rounded-2xl border-slate-200 bg-white px-4 pr-12 text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-slate-900 focus-visible:ring-1 focus-visible:ring-slate-900"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "隐藏密码" : "显示密码"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-900"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">
                  这里只是后台入口重构，登录流程本身没改：仍然读取当前环境里的管理员用户名和密码。
                </div>

                <SubmitButton />
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
