import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import PageHero from "../components/PageHero";
function SportCard({
  title,
  image,
  children
}) {
  return <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="p-5 sm:p-6">
        <h2 className="mb-3 text-xl font-bold text-[#ff6422]">{title}</h2>
        <p className="leading-relaxed text-gray-700">{children}</p>
      </div>
    </article>;
}
export default function SportsPage() {
  const cms = useSection("Sportspage");
  const Franchise = cms("f5");
  const Address = cms("f4");
  const Sports = cms("f3");
  const scholarshipsImage = cms("f2");
  const whyCricketImage = cms("f1");
  return <SectionBoundary name="Sportspage"><>
      <PageHero title={cms("f6")} image={Sports} position="center 35%" />

      {/* Cards grid */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <SportCard title={cms("f7")} image={Address}>{cms("f8")}</SportCard>

          <SportCard title={cms("f9")} image={Sports}>{cms("f10")}</SportCard>

          <SportCard title={cms("f11")} image={scholarshipsImage}>{cms("f12")}</SportCard>

          <SportCard title={cms("f13")} image={whyCricketImage}>{cms("f14")}</SportCard>

          <SportCard title={cms("f15")} image={Franchise}>{cms("f16")}</SportCard>
        </div>
      </section>
    </></SectionBoundary>;
}
