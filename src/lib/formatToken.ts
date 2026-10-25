import { formatUnits } from "viem";

// 与 KerwinToken.sol 中 decimals 保持一致（1 KWT = 10^18）
export const KWT_DECIMALS = 18;

/**
 * 公用转化方法：把 wei（uint256，整数位）转为人类可读的代币数量字符串。
 * 例如：1000000000000000000 -> "1"
 */
export function formatKwt(wei: string | bigint): string {
  return formatUnits(typeof wei === "string" ? BigInt(wei) : wei, KWT_DECIMALS);
}
