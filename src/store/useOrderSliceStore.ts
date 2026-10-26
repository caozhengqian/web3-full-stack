import { create } from "zustand";
import { getAccount, readContract, writeContract } from "wagmi/actions";
import config from "@/rainbowKitConfig";
import { exchangeAbi, exchangeAddress } from "@/generated";
import { parse18 } from "@/lib/formatToken";

type ConfigChainId = (typeof config)["chains"][number]["id"];

// 对应 Exchange.sol 里的 _Order 结构体
export interface OrderItem {
  id: bigint;
  user: `0x${string}`;
  tokenGet: `0x${string}`;
  amountGet: bigint;
  tokenGive: `0x${string}`;
  amountGive: bigint;
  timestamp: bigint;
  canceled: boolean;
  filled: boolean;
}

interface MakeOrderParams {
  tokenGet: string;
  amountGet: string;
  tokenGive: string;
  amountGive: string;
}

interface OrderSliceState {
  orders: OrderItem[];
  loading: boolean; // 读取订单中
  writing: boolean; // 提交交易中
  error: string | null;
  txHash: string | null;
  fetchOrders: () => Promise<void>;
  makeOrder: (params: MakeOrderParams) => Promise<void>;
  cancelOrder: (id: bigint) => Promise<void>;
  fillOrder: (id: bigint) => Promise<void>;
  clearError: () => void;
}

// orders(uint256) 返回的结构体元组
type RawOrder = readonly [
  bigint,
  `0x${string}`,
  `0x${string}`,
  bigint,
  `0x${string}`,
  bigint,
  bigint,
];

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "未知错误";
}

export const useOrderSliceStore = create<OrderSliceState>((set, get) => ({
  orders: [],
  loading: false,
  writing: false,
  error: null,
  txHash: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const { chainId } = getAccount(config);
      if (!chainId) {
        set({ loading: false });
        return;
      }
      const exchangeAddr =
        exchangeAddress[chainId as keyof typeof exchangeAddress];
      if (!exchangeAddr) {
        set({ loading: false });
        return;
      }
      const chain = chainId as ConfigChainId;

      // 1. 读取订单总数
      const count = await readContract(config, {
        address: exchangeAddr,
        abi: exchangeAbi,
        functionName: "orderCount",
        chainId: chain,
      });

      const items: OrderItem[] = [];
      // 2. 逐个读取订单及其状态（cancel / fill）
      for (let i = BigInt(1); i <= count; i++) {
        const [raw, canceled, filled] = await Promise.all([
          readContract(config, {
            address: exchangeAddr,
            abi: exchangeAbi,
            functionName: "orders",
            args: [i],
            chainId: chain,
          }),
          readContract(config, {
            address: exchangeAddr,
            abi: exchangeAbi,
            functionName: "orderCancel",
            args: [i],
            chainId: chain,
          }),
          readContract(config, {
            address: exchangeAddr,
            abi: exchangeAbi,
            functionName: "orderFill",
            args: [i],
            chainId: chain,
          }),
        ]);

        const [id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp] =
          raw as unknown as RawOrder;

        items.push({
          id,
          user,
          tokenGet,
          amountGet,
          tokenGive,
          amountGive,
          timestamp,
          canceled: Boolean(canceled),
          filled: Boolean(filled),
        });
      }

      set({ orders: items, loading: false });
    } catch (error) {
      set({ loading: false, error: errorText(error) });
    }
  },

  makeOrder: async ({ tokenGet, amountGet, tokenGive, amountGive }) => {
    set({ writing: true, error: null, txHash: null });
    try {
      const { address, chainId } = getAccount(config);
      if (!address || !chainId) {
        set({ writing: false, error: "请先连接钱包" });
        return;
      }
      const exchangeAddr =
        exchangeAddress[chainId as keyof typeof exchangeAddress];
      if (!exchangeAddr) {
        set({ writing: false, error: "当前链不支持" });
        return;
      }
      const hash = await writeContract(config, {
        address: exchangeAddr,
        abi: exchangeAbi,
        functionName: "makeOrder",
        args: [
          tokenGet as `0x${string}`,
          parse18(amountGet),
          tokenGive as `0x${string}`,
          parse18(amountGive),
        ],
        chainId: chainId as ConfigChainId,
        account: address,
      });
      set({ writing: false, txHash: hash });
      // 创建成功后刷新订单列表
      await get().fetchOrders();
    } catch (error) {
      set({ writing: false, error: errorText(error) });
    }
  },

  cancelOrder: async (id) => {
    set({ writing: true, error: null, txHash: null });
    try {
      const { address, chainId } = getAccount(config);
      if (!address || !chainId) {
        set({ writing: false, error: "请先连接钱包" });
        return;
      }
      const exchangeAddr =
        exchangeAddress[chainId as keyof typeof exchangeAddress];
      if (!exchangeAddr) {
        set({ writing: false, error: "当前链不支持" });
        return;
      }
      const hash = await writeContract(config, {
        address: exchangeAddr,
        abi: exchangeAbi,
        functionName: "cancelOrder",
        args: [id],
        chainId: chainId as ConfigChainId,
        account: address,
      });
      set({ writing: false, txHash: hash });
      await get().fetchOrders();
    } catch (error) {
      set({ writing: false, error: errorText(error) });
    }
  },

  fillOrder: async (id) => {
    set({ writing: true, error: null, txHash: null });
    try {
      const { address, chainId } = getAccount(config);
      if (!address || !chainId) {
        set({ writing: false, error: "请先连接钱包" });
        return;
      }
      const exchangeAddr =
        exchangeAddress[chainId as keyof typeof exchangeAddress];
      if (!exchangeAddr) {
        set({ writing: false, error: "当前链不支持" });
        return;
      }
      const hash = await writeContract(config, {
        address: exchangeAddr,
        abi: exchangeAbi,
        functionName: "fillOrder",
        args: [id],
        chainId: chainId as ConfigChainId,
        account: address,
      });
      set({ writing: false, txHash: hash });
      await get().fetchOrders();
    } catch (error) {
      set({ writing: false, error: errorText(error) });
    }
  },

  clearError: () => set({ error: null, txHash: null }),
}));
