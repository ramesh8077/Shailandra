import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import PageHero from "../components/PageHero";
export default function SewaPage() {
  const cms = useSection("Sewapage");
  const classroomImage = cms("f5");
  const SupportImg = cms("f4");
  const mentor = cms("f3");
  const university = cms("f2");
  const school = cms("f1");
  // import financeOfficeImg from "../assets/Home-Images/sewa-finance-office.jpg";

  const circleSteps = [{
    label: cms("f6"),
    image: school
  }, {
    label: cms("f7"),
    image: university
  }, {
    label: cms("f8"),
    image: mentor
  }];
  return <SectionBoundary name="Sewapage"><>
      <PageHero title={cms("f9")} image={SupportImg} position="center 38%" />

      {/* Intro */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-700">{cms("f10")}</p>
        <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f11")}</p>
      </section>

      {/* The Circle We are Building */}
      <section className="mx-auto max-w-6xl px-6 pb-12 text-center">
        <h2 className="mb-10 text-3xl font-extrabold text-[#ff6422]">{cms("f12")}</h2>
        <div className="flex items-start justify-center gap-1 sm:items-center sm:gap-10">
          {circleSteps.map((step, i) => <div key={step.label} className="flex min-w-0 flex-1 items-center gap-1 sm:flex-none sm:gap-10">
              <div className="min-w-0 flex-1 sm:flex-none">
                <img src={step.image} alt={step.label} className="mx-auto h-16 w-16 shrink-0 rounded-full object-cover sm:h-36 sm:w-36" />
                <p className="mt-3 text-sm font-bold leading-snug text-gray-900 sm:mt-4 sm:text-lg">{step.label}</p>
              </div>
              {i < circleSteps.length - 1 && <span aria-hidden="true" className="shrink-0 text-lg text-gray-700 sm:text-2xl">→</span>}
            </div>)}
        </div>

        <p className="mx-auto mt-10 max-w-4xl whitespace-pre-line text-left italic leading-relaxed text-gray-700">{cms("f13")}</p>
        <p className="mx-auto mt-4 max-w-4xl whitespace-pre-line text-left leading-relaxed text-gray-700">{cms("f14")}<br />{cms("f15")}</p>
      </section>

      {/* Entrepreneurship Support Beyond the Classroom */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl">
            <img src={classroomImage} alt={cms("f16")} className="aspect-[4/5] h-full w-full object-cover object-center" />
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f17")}</h2>
            <p className="mb-6 whitespace-pre-line leading-relaxed text-gray-700">{cms("f18")}</p>
            <h3 className="mb-4 text-xl font-bold text-[#ff6422]">{cms("f19")}</h3>
            <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f20")}</p>
          </div>
        </div>
      </section>

      {/* Where the Support Goes */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f21")}</h2>
            <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f22")}</p>
          </div>
          <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl">
            <img src={SupportImg} alt={cms("f23")} className="aspect-[4/5] h-full w-full object-cover object-center" />
          </div>
        </div>
      </section>
    </></SectionBoundary>;
}
