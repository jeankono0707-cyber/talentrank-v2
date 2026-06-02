import { ChasseClient } from "@/components/recruiter/ChasseClient";

export const metadata = { title: "Chasse de talents — TalentRank" };

interface PageProps {
  searchParams: Promise<{ classe?: string; profession?: string }>;
}

export default async function ChassePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const initialClass = sp.classe?.toUpperCase();
  const valid = ["S", "A", "B", "C", "D", "E"].includes(initialClass ?? "")
    ? (initialClass as "S" | "A" | "B" | "C" | "D" | "E")
    : null;

  // FIX-7 : si le studio arrive avec ?profession=X (depuis la search du
  // landing /studio), on bypass la search redondante et on va direct sur
  // les cartes de classes pour ce métier.
  const initialProfession = sp.profession?.trim() || null;

  return (
    <ChasseClient
      initialClass={valid}
      initialProfession={initialProfession}
    />
  );
}
