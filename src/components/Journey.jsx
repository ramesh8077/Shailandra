import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
export default function Journey() {
  const cms = useSection("Journey");
  const Img4 = cms("f4");
  const Img3 = cms("f3");
  const Img2 = cms("f2");
  const Img1 = cms("f1");
  const cards = [{
    icon: "▣",
    title: cms("f5"),
    image: Img1,
    text: cms("f6")
  }, {
    icon: "♡",
    title: cms("f7"),
    image: Img2,
    text: cms("f8")
  }, {
    icon: "◎",
    title: cms("f9"),
    image: Img3,
    text: cms("f10")
  }, {
    icon: "★",
    title: cms("f11"),
    image: Img4,
    text: cms("f12")
  }];
  return <SectionBoundary name="Journey"><section id="journey" className="section-space">
      <div className="page-wrap">
        <p className="mx-auto mb-14 max-w-4xl text-center text-lg leading-relaxed text-slate-700">{cms("f13")}</p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(card => <article key={card.title} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#edf6fb]">
                <img src={card.image} alt={card.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>

              <div className="relative p-5 pt-7">
                <span className="absolute -top-6 grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-[#ff6422] font-bold text-white">
                  {card.icon}
                </span>

                <h2 className="mb-3 min-h-12 text-base font-extrabold">
                  {card.title}
                </h2>

                <p className="text-sm leading-6 text-slate-600">
                  {card.text}
                </p>

                <a href="#features" aria-label={`Read about ${card.title}`} className="ml-auto mt-5 grid h-9 w-9 place-items-center rounded-full border border-orange-300 text-[#ff6422] transition group-hover:bg-[#ff6422] group-hover:text-white">
                  →
                </a>
              </div>
            </article>)}
        </div>
      </div>
    </section></SectionBoundary>;
}
