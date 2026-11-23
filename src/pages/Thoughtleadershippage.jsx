import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { FaBuilding, FaBriefcase, FaLaptop, FaRegNewspaper } from "react-icons/fa6";
import PageHero from "../components/PageHero";
export default function ThoughtLeadershipPage() {
  const cms = useSection("Thoughtleadershippage");
  const lettersImage = cms("f7");
  const heroImage = cms("f1");
  const themes = [{
    title: cms("f8"),
    description: cms("f45"),
    Icon: FaRegNewspaper
  }, {
    title: cms("f9"),
    description: cms("f46"),
    Icon: FaBriefcase
  }, {
    title: cms("f10"),
    description: cms("f47"),
    Icon: FaLaptop
  }, {
    title: cms("f11"),
    description: cms("f48"),
    Icon: FaBuilding
  }];
  return <SectionBoundary name="Thoughtleadershippage"><>
      <PageHero title={cms("f34")} image={heroImage} />

      {/* Intro */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        {cms("f40") && <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f40")}</h2>}
        <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f35")}</p>
      </section>

      {/* Lessons from My Journey */}
      {(cms("f41") || cms("f43")) && <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-3 text-2xl font-bold text-[#ff6422]">{cms("f41")}</h2>
        <h3 className="mb-4 text-xl font-semibold text-[#10283d]">{cms("f42")}</h3>
        <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f43")}</p>
      </section>}

      {/* Browse by Theme */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-5 text-center text-2xl font-extrabold text-[#ff6422]">{cms("f36")}</h2>
        {cms("f44") && <p className="mb-8 text-center text-sm font-semibold text-slate-600">{cms("f44")}</p>}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {themes.map(({
            title,
            description,
            Icon
          }) => <div key={title} className="flex min-h-[200px] flex-col items-start rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,39,59,0.04)] transition-shadow hover:shadow-md">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-[#fff0e9] text-lg text-[#ff6422]">
                <Icon aria-hidden="true" />
              </span>
              <p className="text-sm font-bold leading-tight text-[#10283d]">{title}</p>
              {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
                <a href={`/posts?category=${encodeURIComponent(title)}`} className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-[#ff6422]">
                  Explore <span aria-hidden="true">›</span>
                </a>
            </div>)}
        </div>
      </section>

      {/* Letters to Young India */}
      <section className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
        <div className="grid items-center gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:gap-10 sm:p-10 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422] sm:text-3xl">{cms("f49") || cms("f37")}</h2>
            <p className="max-w-xl leading-7 text-gray-700 sm:text-lg sm:leading-8">{cms("f50") || cms("f38")}</p>
          </div>
          <div>
            <img src={lettersImage} alt={cms("f39")} className="block aspect-video w-full rounded-2xl object-cover shadow-sm" />
          </div>
        </div>
      </section>

      {cms("f51") && <section className="article-cta">
        <div className="page-wrap flex justify-center">
          <a href="/posts?type=article" className="group inline-flex min-h-14 items-center gap-3 rounded-xl bg-[#ff6422] px-7 py-4 text-base font-extrabold text-white shadow-[0_8px_24px_rgba(255,100,34,0.28)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#e95318] hover:shadow-[0_12px_30px_rgba(255,100,34,0.38)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6422]/30">
            {cms("f51")}<span aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </section>}

      {/* Latest */}
    </></SectionBoundary>;
}
