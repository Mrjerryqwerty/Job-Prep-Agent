import Link from "next/link";
import { notFound } from "next/navigation";
import { CURRICULUM } from "@/lib/content";
import Assignments from "./Assignments";

export default async function DayPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const day = CURRICULUM.find((d) => d.n === Number(n));
  if (!day) notFound();
  return (
    <div className="space-y-5">
      <div>
        <Link href="/" className="muted text-sm hover:underline">← All days</Link>
        <h1 className="mt-1 text-2xl font-bold">Day {day.n}: {day.theme}</h1>
      </div>
      <div className="card">
        <p className="font-semibold">Study notes</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {day.notes.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>
      <Assignments day={day.n} />
      <div className="card flex items-center justify-between">
        <span className="text-sm">Done with today&apos;s assignments? Practise aloud.</span>
        <Link href="/interview" className="btn">Voice interview</Link>
      </div>
    </div>
  );
}
