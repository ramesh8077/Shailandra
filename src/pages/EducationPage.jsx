import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
export default function EducationPage() {
  const cms = useSection("EducationPage");
  const policyImage = cms("f2");
  const heroImage = cms("f1");
  return <SectionBoundary name="EducationPage"><>
      {/* Hero banner */}
      <PageHero title={cms("f14")} image={heroImage} position="center 38%" />

      {/* Institutional Record */}
      <section className="relative isolate overflow-hidden bg-[#f3f8fb] py-14 sm:py-16 lg:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-orange-100/70 blur-3xl" />
        <div className="page-wrap">
          <div className="mb-9 max-w-3xl">
            <p className="mb-3 text-xs font-extrabold tracking-[0.2em] text-[#f05d25]">Education · institution building</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#10283d] sm:text-4xl">{cms("f16")}</h2>
          </div>

          <div className="grid items-stretch gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8">
            <blockquote className="relative flex min-h-64 flex-col justify-between overflow-hidden rounded-3xl bg-[#10283d] p-7 text-white shadow-xl shadow-[#10283d]/10 sm:p-9">
              <span aria-hidden="true" className="absolute -right-3 -top-12 font-serif text-[190px] leading-none text-white/[0.06]">&rdquo;</span>
              <span aria-hidden="true" className="relative z-10 font-serif text-6xl leading-none text-[#ff6422]">&ldquo;</span>
              <p className="relative z-10 my-5 text-lg font-medium italic leading-8 text-white/95 sm:text-xl">{cms("f15")}</p>
              <footer className="relative z-10 mt-4 flex items-center gap-3 text-xs font-bold tracking-[0.16em] text-white/60">
                <span className="h-px w-8 bg-[#ff6422]" />Shailendra Bhadauria
              </footer>
            </blockquote>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              <div className="space-y-5 text-[15px] leading-7 text-slate-700 sm:text-base sm:leading-8">
                <p className="whitespace-pre-line">{cms("f17")}</p>
                <p className="whitespace-pre-line">{cms("f18")}</p>
              </div>
              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="mb-4 text-sm font-semibold text-slate-500">{cms("f19")}</p>
                <div className="flex flex-wrap gap-3">
                  <Link to={cms("f20")} className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ff6422] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e95318] hover:shadow-md">
                    {cms("f21")}<span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                  <Link to={cms("f22")} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-[#10283d] transition hover:border-[#10283d] hover:bg-slate-50">
                    {cms("f23")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Education Philosophy */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f24")}</h2>
        <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-700">{cms("f25")}</p>
        <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f26")}</p>
      </section>

      {/* Understanding the System */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f27")}</h2>
        <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-700">{cms("f28")}</p>
        <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f29")}</p>
      </section>

      {/* What Changed, For Whom */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f30")}</h2>
            <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f31")}</p>
          </div>
          <img src={policyImage} alt={cms("f32")} className="aspect-video w-full rounded-xl object-cover shadow-sm" />
        </div>
      </section>
    </></SectionBoundary>;
}
