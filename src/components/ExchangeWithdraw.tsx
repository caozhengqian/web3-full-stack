"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { anvil } from "wagmi/chains";
import {
  kerwinTokenAddress,
  useWriteExchangeWithdrawEther,
  useWriteExchangeWithdrawToken,
} from "@/generated";
import { parse18 } from "@/lib/formatToken";

function errorText(error: { shortMessage?: string; message?: string } | null) {
  if (!error) return null;
  return error.shortMessage || error.message || "未知错误";
}

function truncate(hash?: string) {
  if (!hash) return "";
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

export function ExchangeWithdraw() {
  const { isConnected, chainId } = useAccount();
  const [token, setToken] = useState<"KWT" | "ETH">("KWT");
  const [amount, setAmount] = useState("");

  const {
    writeContract: withdrawToken,
    isPending: isWithdrawingToken,
    error: withdrawTokenError,
    data: withdrawTokenHash,
  } = useWriteExchangeWithdrawToken();
  const {
    writeContract: withdrawEther,
    isPending: isWithdrawingEther,
    error: withdrawEtherError,
    data: withdrawEtherHash,
  } = useWriteExchangeWithdrawEther();

  const onAnvil = chainId === anvil.id;
  const tokenAddr =
    chainId != null
      ? kerwinTokenAddress[chainId as keyof typeof kerwinTokenAddress]
      : undefined;

  const handleWithdrawToken = () => {
    if (!tokenAddr || !amount) return;
    // 从交易所取出 KWT（Exchange.withdrawToken 内部 transfer 回登录账号）
    withdrawToken({ args: [tokenAddr, parse18(amount)] });
  };

  const handleWithdrawEther = () => {
    if (!amount) return;
    // 从交易所取出 ETH（Exchange.withdrawEther）
    withdrawEther({ args: [parse18(amount)] });
  };

  return (
    <div className="flex w-96 flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">从交易所取出</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          将交易所内的 KWT 或 ETH 提回钱包
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
          <div className="flex rounded-lg border border-zinc-300 p-1 dark:border-zinc-700">
            {(["KWT", "ETH"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setToken(t)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  token === t
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">
              金额（{token}）
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

          {token === "KWT" ? (
            <>
              <button
                onClick={handleWithdrawToken}
                disabled={isWithdrawingToken || !amount}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
              >
                {isWithdrawingToken ? "取出中…" : "取出 KWT"}
              </button>

              {withdrawTokenError && (
                <p className="text-xs text-red-500">
                  取出失败：{errorText(withdrawTokenError)}
                </p>
              )}
              {withdrawTokenHash && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  取出已提交：{truncate(withdrawTokenHash)}
                </p>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleWithdrawEther}
                disabled={isWithdrawingEther || !amount}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
              >
                {isWithdrawingEther ? "取出中…" : "取出 ETH"}
              </button>

              {withdrawEtherError && (
                <p className="text-xs text-red-500">
                  取出失败：{errorText(withdrawEtherError)}
                </p>
              )}
              {withdrawEtherHash && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  取出已提交：{truncate(withdrawEtherHash)}
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
