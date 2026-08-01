import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { ProviderDirectory } from "@/components/provider-directory";
import { PROVIDERS } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Our team — National Select Urgent Care",
  description:
    "Board-certified physicians, nurse practitioners and physician assistants — all part of our permanent team, not a rotating roster of locums.",
};

export default function ProvidersPage() {
  return (
    <main>
      <PageHero
        eyebrow="Our team"
        title="The clinicians you'll actually see."
        lede="Board-certified physicians, nurse practitioners and physician assistants — all part of our permanent team, not a rotating roster of locums."
      />

      <Container as="section" className="py-[clamp(40px,6vw,80px)]">
        <ProviderDirectory providers={PROVIDERS} />
      </Container>
    </main>
  );
}
