import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
export default function EducationPage() {
  const cms = useSection("EducationPage");
  const policyImage = cms("f2");
  const heroImage = cms("f1");
  const closingSentence = "For me, the true achievement of an institution lies not in how much it grows, but in how many lives it helps move forward.";
  const changedForWhom = cms("f31");
  const closingSentenceIndex = changedForWhom.lastIndexOf(closingSentence);
  return <SectionBoundary name="EducationPage"><>
      {/* Hero banner */}
      <PageHero title={cms("f14")} image={heroImage} position="center 38%" />

      {/* Institutional Record */}
      <section className="relative isolate overflow-hidden bg-[#f3f8fb] py-10 sm:py-12 lg:py-14">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-orange-100/70 blur-3xl" />
        <div className="page-wrap">
          <div className="mb-6 max-w-3xl">
            <p className="mb-3 text-xs font-extrabold tracking-[0.2em] text-[#f05d25]">Education · institution building</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#10283d] sm:text-4xl">{cms("f16")}</h2>
          </div>

          <blockquote className="relative grid gap-3 overflow-hidden rounded-2xl bg-[#10283d] p-5 text-white shadow-lg shadow-[#10283d]/10 sm:grid-cols-[auto_1fr] sm:gap-x-5 sm:p-7 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <span aria-hidden="true" className="relative z-10 font-serif text-5xl leading-none text-[#ff6422]">&ldquo;</span>
            <p className="relative z-10 text-base font-medium italic leading-7 text-white/95 sm:text-lg">{cms("f15")}</p>
            <footer className="relative z-10 flex items-center gap-3 text-xs font-bold tracking-[0.12em] text-white/60 sm:col-start-2 lg:col-start-auto lg:whitespace-nowrap">
              <span className="h-px w-8 bg-[#ff6422]" />Shailendra Bhadauria
            </footer>
          </blockquote>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-50 text-sm font-extrabold text-[#f05d25]">01</span>
                <h3 className="text-lg font-extrabold text-[#10283d]">Institutions and schools</h3>
              </div>
              <p className="whitespace-pre-line text-[15px] leading-7 text-slate-700 sm:text-base sm:leading-8">{cms("f17")}</p>
            </article>

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-50 text-sm font-extrabold text-[#f05d25]">02</span>
                <h3 className="text-lg font-extrabold text-[#10283d]">University and healthcare</h3>
              </div>
              <p className="whitespace-pre-line text-[15px] leading-7 text-slate-700 sm:text-base sm:leading-8">{cms("f18")}</p>
            </article>
          </div>

          <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="text-sm font-semibold text-slate-500">{cms("f19")}</p>
            <div className="flex flex-wrap gap-3">
              <Link to={cms("f20")} className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ff6422] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e95318] hover:shadow-md">
                {cms("f21")}<span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link to={cms("f22")} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-[#10283d] transition hover:border-[#10283d] hover:bg-slate-50">
                {cms("f23")}
              </Link>
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
            <p className="whitespace-pre-line leading-relaxed text-gray-700">
              {closingSentenceIndex === -1 ? changedForWhom : <>
                {changedForWhom.slice(0, closingSentenceIndex)}
                <strong className="font-bold">{closingSentence}</strong>
                {changedForWhom.slice(closingSentenceIndex + closingSentence.length)}
              </>}
            </p>
          </div>
          <img src={policyImage} alt={cms("f32")} className="aspect-video w-full rounded-xl object-cover shadow-sm" />
        </div>
      </section>
    </></SectionBoundary>;
}
