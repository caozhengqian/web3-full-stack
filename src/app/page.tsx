import { Balance } from "@/components/Balance";
import { ExchangeWithdraw } from "@/components/ExchangeWithdraw";
import { KwtDeposit } from "@/components/KwtDeposit";
import { KwtTransfer } from "@/components/KwtTransfer";
import { OrderPanel } from "@/components/OrderPanel";
export default function Home() {
  // 四个卡片：4 × w-96(384px) + 3 × gap-6(24px) = 1608px，订单簿同宽
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="flex w-full max-w-[1608px] flex-col gap-6">
        <div className="flex flex-row items-stretch justify-evenly gap-6">
          <Balance/>
          <KwtDeposit/>
          <ExchangeWithdraw/>
          <KwtTransfer/>
        </div>
        <OrderPanel/>
      </div>
    </div>
  );
}
