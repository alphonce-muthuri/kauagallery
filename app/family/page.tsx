import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { FamilyMembersClient } from "@/components/family/family-members-client";
import { getFamilyMembers } from "@/lib/data";

export default async function FamilyPage() {
  const members = await getFamilyMembers();

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-3 py-4 sm:px-6 sm:py-6">
        <Sidebar />

        <section className="flex-1 min-w-0">
          <FamilyMembersClient initialMembers={members} />
        </section>
      </main>
      <Footer />
    </>
  );
}
