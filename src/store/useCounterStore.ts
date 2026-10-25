import { create } from "zustand";
import { fetchRandomNumber } from "@/lib/mockApi";

interface CounterState {
  count: number;
  loading: boolean;
  increment: () => Promise<void>;
  decrement: () => Promise<void>;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  loading: false,
  increment: async () => {
    set({ loading: true });
    const delta = await fetchRandomNumber();
    set((state) => ({ count: state.count + delta, loading: false }));
  },
  decrement: async () => {
    set({ loading: true });
    const delta = await fetchRandomNumber();
    set((state) => ({ count: state.count - delta, loading: false }));
  },
}));
