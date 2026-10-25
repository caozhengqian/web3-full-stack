/**
 * 模拟接口：延迟 1 秒后随机返回 1~10 的数字
 */
export function fetchRandomNumber(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Math.floor(Math.random() * 10) + 1);
    }, 1000);
  });
}
