"use client"
import { useBalanceSliceStore } from "@/store/useBalanceSliceStore";

export function Balance() {
  const {
    TokenWallet,
    setTokenWallet,
    TokenExchange,
    setTokenExchange,
    EtherWallet,
    setEtherWallet,
    EtherExchange,
    setEtherExchange,
    loading,
  } = useBalanceSliceStore();

  const rows = [
    { label: "钱包 KWT", value: TokenWallet, fetch: setTokenWallet },
    { label: "交易所 KWT", value: TokenExchange, fetch: setTokenExchange },
    { label: "钱包 ETH", value: EtherWallet, fetch: setEtherWallet },
    { label: "交易所 ETH", value: EtherExchange, fetch: setEtherExchange },
  ];

  return (
    <div className="flex w-96 flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-4 py-2 dark:border-zinc-800"
        >
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {row.label}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-medium tabular-nums">{row.value}</span>
            <button
              onClick={() => row.fetch()}
              disabled={loading}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:opacity-50 dark:border-zinc-700"
            >
              获取
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
