"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAccount } from "wagmi";
import { zeroAddress } from "viem";
import { anvil } from "wagmi/chains";
import { kerwinTokenAddress } from "@/generated";
import { useOrderSliceStore, type OrderItem } from "@/store/useOrderSliceStore";
import { format18 } from "@/lib/formatToken";

function truncate(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 10)}…${addr.slice(-8)}`;
}

function formatTime(ts: bigint) {
  const n = Number(ts);
  if (n === 0) return "-";
  return new Date(n * 1000).toLocaleString();
}

function statusInfo(o: Pick<OrderItem, "filled" | "canceled">) {
  if (o.filled) return { text: "已成交", cls: "text-green-600 dark:text-green-400" };
  if (o.canceled) return { text: "已取消", cls: "text-zinc-400" };
  return { text: "待成交", cls: "text-amber-600 dark:text-amber-400" };
}

export function OrderPanel() {
  const { address, isConnected, chainId } = useAccount();
  const {
    orders,
    loading,
    writing,
    error,
    txHash,
    fetchOrders,
    makeOrder,
    cancelOrder,
    fillOrder,
  } = useOrderSliceStore();

  // 创建订单弹窗表单字段
  const [showModal, setShowModal] = useState(false);
  const [tokenGet, setTokenGet] = useState("");
  const [amountGet, setAmountGet] = useState("");
  const [tokenGive, setTokenGive] = useState("");
  const [amountGive, setAmountGive] = useState("");

  const kwtAddr =
    chainId != null
      ? kerwinTokenAddress[chainId as keyof typeof kerwinTokenAddress]
      : undefined;

  // 链就绪后，给创建订单表单填充默认值：得到 KWT，给出 ETH
  useEffect(() => {
    if (!tokenGet && kwtAddr) setTokenGet(kwtAddr);
    if (!tokenGive) setTokenGive(zeroAddress);
  }, [kwtAddr, tokenGet, tokenGive]);

  const onAnvil = chainId === anvil.id;

  const tokenLabel = (addr: string) => {
    if (addr === zeroAddress) return "ETH";
    if (kwtAddr && addr.toLowerCase() === kwtAddr.toLowerCase()) return "KWT";
    return truncate(addr);
  };

  const isMine = (o: OrderItem) =>
    !!address && o.user.toLowerCase() === address.toLowerCase();

  // 其他人订单：可成交（未取消未成交且非本人）
  const otherOrders = orders.filter(
    (o) => !o.filled && !o.canceled && !isMine(o),
  );
  // 我创建的订单：可取消（未取消未成交且是本人）
  const myOrders = orders.filter((o) => !o.filled && !o.canceled && isMine(o));
  // 已完成交易：已成交或已取消，无操作按钮
  const closedOrders = orders.filter((o) => o.filled || o.canceled);

  const handleCreate = async () => {
    if (!tokenGet || !amountGet || !tokenGive || !amountGive) return;
    await makeOrder({ tokenGet, amountGet, tokenGive, amountGive });
    // 无错误则视为成功，关闭弹窗
    if (!useOrderSliceStore.getState().error) {
      setShowModal(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            disabled={!onAnvil}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            创建订单
          </button>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">订单簿</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              其他人订单可成交，我创建的订单可取消
            </p>
          </div>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading || !onAnvil}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
        >
          {loading ? "加载中…" : "刷新订单"}
        </button>
      </div>

      {!isConnected ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">请先连接钱包</p>
      ) : !onAnvil ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          请切换到 Anvil 网络 (Chain ID: {anvil.id})
        </p>
      ) : (
        <>
          {error && <p className="text-xs text-red-500">操作失败：{error}</p>}
          {txHash && (
            <p className="text-xs text-green-600 dark:text-green-400">
              交易已提交：{truncate(txHash)}
            </p>
          )}

          <div className="grid grid-cols-3 gap-4">
            {/* 第一列：其他人订单 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">其他人订单</h3>
              {otherOrders.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">暂无</p>
              ) : (
                otherOrders.map((o) => (
                  <OrderCard
                    key={o.id.toString()}
                    order={o}
                    tokenLabel={tokenLabel}
                  >
                    <button
                      onClick={() => fillOrder(o.id)}
                      disabled={writing}
                      className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
                    >
                      成交订单
                    </button>
                  </OrderCard>
                ))
              )}
            </div>

            {/* 第二列：我创建的订单 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">我创建的订单</h3>
              {myOrders.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">暂无</p>
              ) : (
                myOrders.map((o) => (
                  <OrderCard
                    key={o.id.toString()}
                    order={o}
                    tokenLabel={tokenLabel}
                  >
                    <button
                      onClick={() => cancelOrder(o.id)}
                      disabled={writing}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
                    >
                      取消订单
                    </button>
                  </OrderCard>
                ))
              )}
            </div>

            {/* 第三列：已完成交易 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">已完成交易</h3>
              {closedOrders.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">暂无</p>
              ) : (
                closedOrders.map((o) => (
                  <OrderCard
                    key={o.id.toString()}
                    order={o}
                    tokenLabel={tokenLabel}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 创建订单弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">创建订单</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                关闭
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  创建者得到代币地址 (tokenGet)
                </label>
                <input
                  type="text"
                  value={tokenGet}
                  onChange={(e) => setTokenGet(e.target.value)}
                  placeholder="KWT 合约地址"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  创建者得到数量 (amountGet)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amountGet}
                  onChange={(e) => setAmountGet(e.target.value)}
                  placeholder="创建者得到的 KWT 数量"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  创建者给出代币地址 (tokenGive)
                </label>
                <input
                  type="text"
                  value={tokenGive}
                  onChange={(e) => setTokenGive(e.target.value)}
                  placeholder="0x0 表示 ETH"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  创建者给出数量 (amountGive)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amountGive}
                  onChange={(e) => setAmountGive(e.target.value)}
                  placeholder="创建者给出的 ETH 数量"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500">创建失败：{error}</p>}

            <button
              onClick={handleCreate}
              disabled={
                writing || !tokenGet || !amountGet || !tokenGive || !amountGive
              }
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
            >
              {writing ? "提交中…" : "创建订单"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  tokenLabel,
  children,
}: {
  order: OrderItem;
  tokenLabel: (addr: string) => string;
  children?: ReactNode;
}) {
  const status = statusInfo(order);
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">#{order.id.toString()}</span>
        <span className={`text-xs font-medium ${status.cls}`}>{status.text}</span>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        创建者：{truncate(order.user)}
      </p>
      <div className="flex flex-col gap-1 text-sm">
        <span>
          创建者得到{" "}
          <span className="font-medium tabular-nums">
            {format18(order.amountGet)}
          </span>{" "}
          {tokenLabel(order.tokenGet)}
        </span>
        <span>
          创建者给出{" "}
          <span className="font-medium tabular-nums">
            {format18(order.amountGive)}
          </span>{" "}
          {tokenLabel(order.tokenGive)}
        </span>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        时间：{formatTime(order.timestamp)}
      </p>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
