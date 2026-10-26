import { create } from "zustand";
import { getAccount, getBalance, readContract, watchBlockNumber } from "wagmi/actions";
import { zeroAddress } from "viem";
import config from "@/rainbowKitConfig";
import {
  exchangeAbi,
  exchangeAddress,
  kerwinTokenAbi,
  kerwinTokenAddress,
} from "@/generated";
import { format18 } from "@/lib/formatToken";

type ConfigChainId = (typeof config)["chains"][number]["id"];

interface BalanceSliceState {
  TokenWallet: string; // 钱包 KWT 余额
  TokenExchange: string; // 交易所 KWT 余额
  EtherWallet: string; // 钱包 ETH 余额
  EtherExchange: string; // 交易所 ETH 余额
  loading: boolean;
  fetchAll: (silent?: boolean) => Promise<void>;
  watchBalances: () => () => void;
}

export const useBalanceSliceStore = create<BalanceSliceState>((set, get) => ({
  TokenWallet: "0",
  TokenExchange: "0",
  EtherWallet: "0",
  EtherExchange: "0",
  loading: false,

  // 一次性查询四个余额；silent 为 true 时不切换 loading（用于区块监听自动刷新）
  fetchAll: async (silent = false) => {
    if (!silent) set({ loading: true });
    try {
      const { address, chainId } = getAccount(config);
      if (!address || !chainId) {
        set({ loading: false });
        return;
      }
      const tokenAddress =
        kerwinTokenAddress[chainId as keyof typeof kerwinTokenAddress];
      const exchangeAddr =
        exchangeAddress[chainId as keyof typeof exchangeAddress];
      if (!tokenAddress || !exchangeAddr) {
        set({ loading: false });
        return;
      }
      const chain = chainId as ConfigChainId;

      // 并行读取四个余额
      const [tokenWallet, tokenExchange, etherWallet, etherExchange] =
        await Promise.all([
          readContract(config, {
            address: tokenAddress,
            abi: kerwinTokenAbi,
            functionName: "balanceOf",
            args: [address],
            chainId: chain,
          }),
          readContract(config, {
            address: exchangeAddr,
            abi: exchangeAbi,
            functionName: "balanceOf",
            args: [tokenAddress, address],
            chainId: chain,
          }),
          getBalance(config, { address, chainId: chain }),
          readContract(config, {
            address: exchangeAddr,
            abi: exchangeAbi,
            functionName: "balanceOf",
            args: [zeroAddress, address],
            chainId: chain,
          }),
        ]);

      set({
        TokenWallet: format18(tokenWallet),
        TokenExchange: format18(tokenExchange),
        EtherWallet: format18(etherWallet.value),
        EtherExchange: format18(etherExchange),
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
    }
  },

  // 实时监听：每个新区块触发一次全量刷新，返回取消监听的函数
  watchBalances: () => {
    return watchBlockNumber(config, {
      onBlockNumber: () => {
        get().fetchAll(true);
      },
    });
  },
}));
