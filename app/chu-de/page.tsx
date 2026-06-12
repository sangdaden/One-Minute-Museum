import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SectionTitle from "@/components/decor/SectionTitle";
import CategoryGrid from "@/components/home/CategoryGrid";

export default async function TopicsPage() {
  const t = await getTranslations("Topics");
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1100px] px-5 pb-24 pt-10 sm:px-8">
        <SectionTitle>{t("title")}</SectionTitle>
        <p className="mb-8 max-w-2xl text-ink-soft">{t("intro")}</p>
        <CategoryGrid bare />
      </main>
    </>
  );
}
