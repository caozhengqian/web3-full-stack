import { formatUnits } from "viem";

/**
 * 公用转化方法：把 wei（uint256）转为 18 位小数数量字符串。
 * 例如：1000000000000000000 -> "1"
 */
export function format18(wei: string | bigint): string {
  return formatUnits(typeof wei === "string" ? BigInt(wei) : wei, 18);
}
