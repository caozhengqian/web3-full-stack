import { create } from "zustand";
import { getAccount, getBalance, readContract } from "wagmi/actions";
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
  setTokenWallet: () => Promise<void>;
  setTokenExchange: () => Promise<void>;
  setEtherWallet: () => Promise<void>;
  setEtherExchange: () => Promise<void>;
}

export const useBalanceSliceStore = create<BalanceSliceState>((set) => ({
  TokenWallet: "0",
  TokenExchange: "0",
  EtherWallet: "0",
  EtherExchange: "0",
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
      // 读取钱包在 KerwinToken 合约上的 KWT 余额
      const balance = await readContract(config, {
        address: tokenAddress,
        abi: kerwinTokenAbi,
        functionName: "balanceOf",
        args: [address],
        chainId: chainId as ConfigChainId,
      });
      set({ TokenWallet: format18(balance), loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  setTokenExchange: async () => {
    set({ loading: true });
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
      // 读取当前账户在交易所里的 KWT 余额（Exchange.balanceOf）
      const balance = await readContract(config, {
        address: exchangeAddr,
        abi: exchangeAbi,
        functionName: "balanceOf",
        args: [tokenAddress, address],
        chainId: chainId as ConfigChainId,
      });
      set({ TokenExchange: format18(balance), loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  setEtherWallet: async () => {
    set({ loading: true });
    try {
      const { address, chainId } = getAccount(config);
      if (!address || !chainId) {
        set({ loading: false });
        return;
      }
      // 读取钱包原生 ETH 余额
      const balance = await getBalance(config, {
        address,
        chainId: chainId as ConfigChainId,
      });
      set({ EtherWallet: format18(balance.value), loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  setEtherExchange: async () => {
    set({ loading: true });
    try {
      const { address, chainId } = getAccount(config);
      if (!address || !chainId) {
        set({ loading: false });
        return;
      }
      const exchangeAddr =
        exchangeAddress[chainId as keyof typeof exchangeAddress];
      if (!exchangeAddr) {
        set({ loading: false });
        return;
      }
      // 读取当前账户在交易所里的 ETH 余额（ETH 在 tokens 里以 address(0) 为 key）
      const balance = await readContract(config, {
        address: exchangeAddr,
        abi: exchangeAbi,
        functionName: "balanceOf",
        args: [zeroAddress, address],
        chainId: chainId as ConfigChainId,
      });
      set({ EtherExchange: format18(balance), loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));
