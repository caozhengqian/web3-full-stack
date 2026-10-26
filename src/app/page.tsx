import { Balance } from "@/components/Balance";
import { ExchangeWithdraw } from "@/components/ExchangeWithdraw";
import { KwtDeposit } from "@/components/KwtDeposit";
import { KwtTransfer } from "@/components/KwtTransfer";
export default function Home() {
  return (
    <div className="flex flex-row items-stretch justify-evenly gap-6 p-6">
      <Balance/>
      <KwtDeposit/>
      <ExchangeWithdraw/>
      <KwtTransfer/>
    </div>
  );
}
