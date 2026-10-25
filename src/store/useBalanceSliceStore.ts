import { create } from "zustand";
import { getAccount, readContract } from "wagmi/actions";
import config from "@/rainbowKitConfig";
import { kerwinTokenAbi, kerwinTokenAddress } from "@/generated";
import { formatKwt } from "@/lib/formatToken";

type ConfigChainId = (typeof config)["chains"][number]["id"];

interface BalanceSliceState {
  TokenWallet: string;
  TokenExchange: number;
  EtherWallet: number;
  EtherExchange: number;
  loading: boolean;
  setTokenWallet: () => Promise<void>;
  setTokenExchange: () => Promise<void>;
  setEtherWallet: () => Promise<void>;
  setEtherExchange: () => Promise<void>;
}

export const useBalanceSliceStore = create<BalanceSliceState>((set) => ({
  TokenWallet: "0", // 钱包KWT余额（格式化后，已除 10^18）
  TokenExchange: 0, // 交易所KWT
  EtherWallet: 0, // 钱包ETH
  EtherExchange: 0, // 交易所ETH
  loading: false,
  setTokenWallet: async () => {
    set({ loading: true });
    try {
      const { address, chainId } = getAccount(config);
      if (!address || !chainId) {
        set({ loading: false });
        return;
      }
      // 根据当前连接链动态解析合约地址
      const tokenAddress =
        kerwinTokenAddress[chainId as keyof typeof kerwinTokenAddress];
      if (!tokenAddress) {
        set({ loading: false });
        return;
      }
      // 读取钱包在 KerwinToken 合约上的 KWT 余额（wei，uint256 -> bigint）
      const balance = await readContract(config, {
        address: tokenAddress,
        abi: kerwinTokenAbi,
        functionName: "balanceOf",
        args: [address],
        chainId: chainId as ConfigChainId,
      });
      set({ TokenWallet: formatKwt(balance), loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  setTokenExchange: async () => {
    set({ loading: true });
    set((state) => ({ TokenExchange: state.TokenExchange, loading: false }));
  },
  setEtherWallet: async () => {
    set({ loading: true });
    set((state) => ({ EtherWallet: state.EtherWallet, loading: false }));
  },
  setEtherExchange: async () => {
    set({ loading: true });
    set((state) => ({ EtherExchange: state.EtherExchange, loading: false }));
  },
}));
