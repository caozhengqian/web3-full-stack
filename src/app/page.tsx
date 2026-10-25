import { KwtBalance } from "@/components/KwtBalance";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">KWT 余额</h1>
        <KwtBalance />
      </main>
    </div>
  );
}
