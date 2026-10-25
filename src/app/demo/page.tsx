"use client";

import { useCounterStore } from "@/store/useCounterStore";
import {Balance} from "@/components/Balance";
import { KwtDeposit } from "@/components/KwtDeposit";

export default function DemoPage() {
  const { count, loading, increment, decrement } = useCounterStore();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-2xl font-semibold tracking-tight">Zustand Demo</h1>
      <Balance/>
      <KwtDeposit/>
      <p className="text-6xl font-bold tabular-nums">{count}</p>

      <div className="flex gap-3">
        <button
          onClick={decrement}
          disabled={loading}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
        >
          减少
        </button>
        <button
          onClick={increment}
          disabled={loading}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          增加
        </button>
      </div>

      {loading && <p className="text-sm text-zinc-500">请求中…</p>}
    </div>
  );
}
