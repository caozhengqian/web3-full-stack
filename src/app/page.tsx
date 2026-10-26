import { Balance } from "@/components/Balance";
import { KwtDeposit } from "@/components/KwtDeposit";
import { KwtTransfer } from "@/components/KwtTransfer";
export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <Balance/>
      <KwtDeposit/>
      <KwtTransfer/>
    </div>
  );
}
