import { notFound } from "next/navigation";
import { ROUNDS, type RoundNo } from "@/lib/content";
import Room from "./Room";

export default async function RoundPage({ params }: { params: Promise<{ round: string }> }) {
  const { round } = await params;
  const r = Number(round) as RoundNo;
  if (!ROUNDS[r]) notFound();
  return <Room round={r} name={ROUNDS[r].name} />;
}
