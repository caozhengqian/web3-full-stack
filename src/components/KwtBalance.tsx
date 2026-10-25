"use client"

import { useAccount, useSwitchChain } from "wagmi"
import { anvil } from "wagmi/chains"

import { useReadKerwinTokenBalanceOf } from "@/generated"
import { format18 } from "@/lib/formatToken"

function truncate(addr?: string) {
    if (!addr) return ""
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function KwtBalance() {
    const { address, isConnected, chainId } = useAccount()
    const { switchChain, isPending } = useSwitchChain()

    const onAnvil = chainId === anvil.id

    // 直接调用 KerwinToken.sol 的 balanceOf(address) 读取余额
    // ABI 与部署地址由 `pnpm generate` 从 foundry 编译产物/广播记录生成，见 wagmi.config.ts
    const { data, isLoading, isError } = useReadKerwinTokenBalanceOf({
        args: address ? [address] : undefined,
        query: { enabled: isConnected && onAnvil && !!address },
    })

    const formatted = data !== undefined ? format18(data) : undefined

    return (
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {!isConnected ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    连接钱包后查看 KWT 余额
                </p>
            ) : !onAnvil ? (
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        请切换到 Anvil 网络 (Chain ID: {anvil.id})
                    </p>
                    <button
                        onClick={() => switchChain({ chainId: anvil.id })}
                        disabled={isPending}
                        className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
                    >
                        {isPending ? "切换中…" : "切换到 Anvil"}
                    </button>
                </div>
            ) : isLoading ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">读取余额中…</p>
            ) : isError ? (
                <p className="text-sm text-red-500">读取 KWT 余额失败</p>
            ) : (
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {truncate(address)}
                    </p>
                    <p className="text-3xl font-semibold tracking-tight">
                        {formatted ?? "0"}{" "}
                        <span className="text-lg font-normal text-zinc-500 dark:text-zinc-400">
                            KWT
                        </span>
                    </p>
                </div>
            )}
        </div>
    )
}
