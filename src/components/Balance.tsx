"use client"
import { useBalanceSliceStore } from "@/store/useBalanceSliceStore";

export function Balance() {
  const { TokenWallet, loading, setTokenWallet } = useBalanceSliceStore();

  return (
    <div className="flex flex-col items-center gap-3">
      <div>TokenWallet：{TokenWallet}</div>
      <button
        onClick={() => setTokenWallet()}
        disabled={loading}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
      >
        获取钱包KWT余额
      </button>
    </div>
  )
}
