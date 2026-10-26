"use client"

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { anvil } from "wagmi/chains";
import { useBalanceSliceStore } from "@/store/useBalanceSliceStore";

export function Balance() {
  const { isConnected, chainId } = useAccount();
  const {
    TokenWallet,
    TokenExchange,
    EtherWallet,
    EtherExchange,
    loading,
    fetchAll,
    watchBalances,
  } = useBalanceSliceStore();

  const onAnvil = chainId === anvil.id;

  // 初始化/网络切换时查询余额，并启动新区块实时监听
  useEffect(() => {
    if (!isConnected || !onAnvil) return;
    fetchAll();
    const unwatch = watchBalances();
    return unwatch;
  }, [isConnected, onAnvil, fetchAll, watchBalances]);

  const rows = [
    { label: "钱包 KWT", value: TokenWallet },
    { label: "交易所 KWT", value: TokenExchange },
    { label: "钱包 ETH", value: EtherWallet },
    { label: "交易所 ETH", value: EtherExchange },
  ];

  return (
    <div className="flex w-96 flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">余额</h2>
        <button
          onClick={() => fetchAll()}
          disabled={loading || !onAnvil}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:opacity-50 dark:border-zinc-700"
        >
          {loading ? "加载中…" : "刷新"}
        </button>
      </div>

      {!isConnected ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">请先连接钱包</p>
      ) : !onAnvil ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          请切换到 Anvil 网络 (Chain ID: {anvil.id})
        </p>
      ) : (
        rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-4 py-2 dark:border-zinc-800"
          >
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {row.label}
            </span>
            <span className="font-medium tabular-nums">{row.value}</span>
          </div>
        ))
      )}
    </div>
  )
}
