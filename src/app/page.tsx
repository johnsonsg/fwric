import { CategoryGrid } from "@/components/home/category-grid";
import { Hero } from "@/components/home/hero";
import { ReefFeature } from "@/components/home/reef-feature";
import { VisitSection } from "@/components/home/visit-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <CategoryGrid />
        <ReefFeature />
        <VisitSection />
      </main>
      <SiteFooter />
    </>
  );
}
