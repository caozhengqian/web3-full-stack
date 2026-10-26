"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { anvil } from "wagmi/chains";
import { useWriteKerwinTokenTransfer } from "@/generated";
import { parse18 } from "@/lib/formatToken";

function errorText(error: { shortMessage?: string; message?: string } | null) {
  if (!error) return null;
  return error.shortMessage || error.message || "未知错误";
}

function truncate(hash?: string) {
  if (!hash) return "";
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

export function KwtTransfer() {
  const { isConnected, chainId } = useAccount();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const {
    writeContract: transfer,
    isPending: isTransferring,
    error: transferError,
    data: transferHash,
  } = useWriteKerwinTokenTransfer();

  const onAnvil = chainId === anvil.id;

  const handleTransfer = () => {
    if (!to || !amount) return;
    // 调用 KerwinToken.transfer 将 KWT 转到目标地址
    transfer({ args: [to as `0x${string}`, parse18(amount)] });
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">转账 KWT</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          将当前账号的 KWT 转到其他账号
        </p>
      </div>

      {!isConnected ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">请先连接钱包</p>
      ) : !onAnvil ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          请切换到 Anvil 网络 (Chain ID: {anvil.id})
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">
              收款地址
            </label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">
              金额（KWT）
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="输入金额"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <button
            onClick={handleTransfer}
            disabled={isTransferring || !to || !amount}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            {isTransferring ? "转账中…" : "转账 KWT"}
          </button>

          {transferError && (
            <p className="text-xs text-red-500">
              转账失败：{errorText(transferError)}
            </p>
          )}
          {transferHash && (
            <p className="text-xs text-green-600 dark:text-green-400">
              转账已提交：{truncate(transferHash)}
            </p>
          )}
        </>
      )}
    </div>
  );
}
