"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { anvil } from "wagmi/chains";
import {
  exchangeAddress,
  kerwinTokenAddress,
  useWriteExchangeDepositEther,
  useWriteExchangeDepositToken,
  useWriteKerwinTokenApprove,
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

export function KwtDeposit() {
  const { isConnected, chainId } = useAccount();
  const [token, setToken] = useState<"KWT" | "ETH">("KWT");
  const [amount, setAmount] = useState("");

  const {
    writeContract: approve,
    isPending: isApproving,
    error: approveError,
    data: approveHash,
  } = useWriteKerwinTokenApprove();
  const {
    writeContract: deposit,
    isPending: isDepositing,
    error: depositError,
    data: depositHash,
  } = useWriteExchangeDepositToken();
  const {
    writeContract: depositEther,
    isPending: isDepositingEther,
    error: depositEtherError,
    data: depositEtherHash,
  } = useWriteExchangeDepositEther();

  const onAnvil = chainId === anvil.id;
  const exchangeAddr =
    chainId != null
      ? exchangeAddress[chainId as keyof typeof exchangeAddress]
      : undefined;
  const tokenAddr =
    chainId != null
      ? kerwinTokenAddress[chainId as keyof typeof kerwinTokenAddress]
      : undefined;

  const handleApprove = () => {
    if (!exchangeAddr || !amount) return;
    // 第一步：授权 KWT 给 Exchange.sol（KerwinToken.approve）
    approve({ args: [exchangeAddr, parse18(amount)] });
  };

  const handleDeposit = () => {
    if (!tokenAddr || !amount) return;
    // 第二步：转账 KWT 到交易所（Exchange.depositToken 内部走 transferFrom）
    deposit({ args: [tokenAddr, parse18(amount)] });
  };

  const handleDepositEther = () => {
    if (!amount) return;
    // 存入 ETH 到交易所（Exchange.depositEther 是 payable，随交易附带 value）
    depositEther({ value: parse18(amount) });
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">存入交易所</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          KWT 需先授权再转账；ETH 可直接存入
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
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isApproving || !amount}
                  className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
                >
                  {isApproving ? "授权中…" : "授权 KWT"}
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={isDepositing || !amount}
                  className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
                >
                  {isDepositing ? "转账中…" : "转账到交易所"}
                </button>
              </div>

              {approveError && (
                <p className="text-xs text-red-500">
                  授权失败：{errorText(approveError)}
                </p>
              )}
              {approveHash && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  授权已提交：{truncate(approveHash)}
                </p>
              )}
              {depositError && (
                <p className="text-xs text-red-500">
                  转账失败：{errorText(depositError)}
                </p>
              )}
              {depositHash && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  转账已提交：{truncate(depositHash)}
                </p>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleDepositEther}
                disabled={isDepositingEther || !amount}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
              >
                {isDepositingEther ? "存入中…" : "存入 ETH"}
              </button>

              {depositEtherError && (
                <p className="text-xs text-red-500">
                  存入失败：{errorText(depositEtherError)}
                </p>
              )}
              {depositEtherHash && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  存入已提交：{truncate(depositEtherHash)}
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
