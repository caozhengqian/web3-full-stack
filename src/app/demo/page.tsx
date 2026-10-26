"use client";

import { Balance } from "@/components/Balance";
import { KwtDeposit } from "@/components/KwtDeposit";

export default function DemoPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-2xl font-semibold tracking-tight">Demo</h1>
      <Balance />
      <KwtDeposit />
    </div>
  );
}
