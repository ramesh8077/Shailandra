import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import PageHero from "../components/PageHero";
import Blogs from "../components/Blogs";
import { FaInstagram, FaYoutube } from "react-icons/fa6";
import episode1Image from "../assets/WebImages/EP-1.jpg";
import episode2Image from "../assets/WebImages/EP-2.jpg";
import episode3Image from "../assets/WebImages/EP-3.jpg";
import episode4Image from "../assets/WebImages/EP-4.jpg";
import episode5Image from "../assets/WebImages/EP-5.jpg";
import episode6Image from "../assets/WebImages/EP-6.jpg";
export default function ChaiPeCharchaPage() {
  const cms = useSection("ChaiPaiCharchaPage");
  const seasonImage = cms("f1");
  const episodes = [{
    image: episode1Image,
    title: "Jobs for Bharat 2047",
    link: "https://www.youtube.com/shorts/GMydyafcAZE"
  }, {
    image: episode2Image,
    title: "India's Manufacturing Moment?",
    link: "https://www.youtube.com/shorts/ms8W8Foymzo"
  }, {
    image: episode3Image,
    title: "Degree Se Skills Tak",
    link: "https://www.youtube.com/shorts/4LjDu5481PA"
  }, {
    image: episode4Image,
    title: "AI: Friend or Foe?",
    link: "https://www.youtube.com/shorts/JojQiOy0KOc"
  }, {
    image: episode5Image,
    title: "Clean India, Green India?",
    link: "https://www.youtube.com/shorts/bbCzJ1iaXiw"
  }, {
    image: episode6Image,
    title: "Bharat in a Multipolar World",
    link: "https://www.youtube.com/shorts/hwM3ahuLfx0"
  }];
  return <SectionBoundary name="ChaiPaiCharchaPage"><>
      <PageHero title="Coffee Pe Charcha 2047" image={seasonImage} />

      {/* Intro */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 text-lg italic font-semibold leading-relaxed text-gray-900">Some of my best conversations about India's future have happened over coffee, not in boardrooms.</p>
            <p className="mb-6 leading-relaxed text-gray-600">Coffee Pe Charcha started as an attempt to bring that same informality, real conversation, real disagreement, and real curiosity to a wider audience.</p>

            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#ff6422]">
                <span className="text-white">▶</span>
              </div>
              <div>
                <p className="font-bold text-[#ff6422]">{cms("f35")}</p>
                <p className="text-gray-800">{cms("f36")}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <a href={cms("f37")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#ff6422] hover:text-[#ff6422]">
                    <FaYoutube aria-hidden="true" className="text-red-600" />{cms("f38")}</a>
                  <a href={cms("f39")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#ff6422] hover:text-[#ff6422]">
                    <FaInstagram aria-hidden="true" className="text-[#c13584]" />{cms("f40")}</a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <img src={seasonImage} alt="Coffee Pe Charcha 2047 Season 1" className="block h-auto w-full rounded-md object-contain" />
          </div>
        </div>
      </section>

      {/* Season 1 Episodes */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-1 text-center text-3xl font-extrabold text-[#ff6422]">Season 1 — episodes</h2>
        <p className="mb-8 text-center text-sm text-gray-600"></p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {episodes.map(episode => <a key={episode.title} href={episode.link} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-xl bg-[#ff6422] text-white transition hover:-translate-y-1 hover:shadow-lg">
              <img src={episode.image} alt={episode.title} className="aspect-video w-full object-cover" />
              <div className="flex min-h-20 items-center justify-between gap-3 px-5 py-4">
                <span className="font-semibold leading-snug">{episode.title}</span>
                <FaYoutube aria-hidden="true" className="shrink-0 text-xl" />
              </div>
            </a>)}
        </div>
      </section>

      <Blogs />

      {/* Have a question for a future episode? */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-8 rounded-md border border-gray-200 bg-gray-50 p-6 sm:p-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f46")}</h2>
            <p className="leading-relaxed text-gray-700">{cms("f47")}</p>
          </div>
          <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-800">{cms("f48")}<input type="text" placeholder={cms("f49")} className="mt-1 w-full border-b border-gray-300 pb-2 text-sm outline-none" />
            </label>
            <label className="text-sm font-semibold text-gray-800">{cms("f50")}<textarea placeholder={cms("f51")} rows={3} className="mt-1 w-full border-b border-gray-300 pb-2 text-sm outline-none" />
            </label>
            <button className="rounded-md bg-[#ff6422] px-5 py-3 text-sm font-bold text-white">{cms("f52")}</button>
          </form>
        </div>
      </section>
    </></SectionBoundary>;
}
