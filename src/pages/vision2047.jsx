import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import PageHero from "../components/PageHero";
export default function Vision2047Page() {
  const cms = useSection("vision2047");
  const questionImage = cms("f5");
  const accountabilityImage = cms("f4");
  const educationImage = cms("f3");
  const skillImage = cms("f2");
  const heroImage = cms("f1");
  const fourAsks = [{
    hindi: cms("f6"),
    english: cms("f7"),
    image: skillImage,
    text: cms("f8")
  }, {
    hindi: cms("f9"),
    english: cms("f10"),
    image: educationImage,
    text: cms("f11")
  }, {
    hindi: cms("f12"),
    english: cms("f13"),
    image: accountabilityImage,
    text: cms("f14")
  }, {
    hindi: cms("f15"),
    english: cms("f16"),
    image: questionImage,
    text: cms("f17")
  }];
  return <SectionBoundary name="vision2047"><>
      <PageHero title={cms("f25")} image={heroImage} position="center 35%" />

      {/* What India @100 Must Look Like */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f26")}</h2>
        <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-700">{cms("f27")}</p>
        <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-700">{cms("f28")}</p>
        <p className="whitespace-pre-line leading-relaxed text-gray-700">{cms("f29")}</p>
      </section>

      {/* The Four Asks */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-3 text-2xl font-bold text-[#ff6422]">{cms("f30")}</h2>
        <p className="mb-8 italic leading-relaxed text-gray-700">{cms("f31")}</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fourAsks.map(ask => <div key={ask.english} className="rounded-md bg-gray-50 p-5">
              <img src={ask.image} alt="" className="mb-4 aspect-[4/3] w-full rounded-lg object-cover" />
              <p className="text-lg font-bold text-[#ff6422]">{ask.hindi}</p>
              <p className="mb-3 text-xs font-semibold tracking-wide text-gray-800">{ask.english}</p>
              <p className="text-sm leading-relaxed text-gray-700">{ask.text}</p>
            </div>)}
        </div>
      </section>

    </></SectionBoundary>;
}
