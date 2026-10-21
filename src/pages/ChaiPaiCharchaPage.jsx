import { SectionBoundary } from "../cms/PublicCMS";
import { PostList } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import PageHero from "../components/PageHero";
import { FaInstagram, FaYoutube } from "react-icons/fa6";
export default function ChaiPeCharchaPage() {
  const cms = useSection("ChaiPaiCharchaPage");
  const seasonImage = cms("f1");
  const hosts = [{
    role: cms("f8"),
    name: cms("f9"),
    bio: [cms("f10"), cms("f11")],
    quote: cms("f12"),
    closing: cms("f13")
  }, {
    role: cms("f14"),
    name: cms("f15"),
    bio: [cms("f16"), cms("f17")],
    quote: cms("f18"),
    closing: cms("f19")
  }];
  return <SectionBoundary name="ChaiPaiCharchaPage"><>
      <PageHero title={cms("f32")} image={seasonImage} />

      {/* Intro */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 text-lg italic font-semibold leading-relaxed text-gray-900">{cms("f33")}</p>
            <p className="mb-6 leading-relaxed text-gray-600">{cms("f34")}</p>

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
            <img src={seasonImage} alt={cms("f41")} className="block h-auto w-full rounded-md object-contain" />
          </div>
        </div>
      </section>

      {/* Meet the Hosts */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-1 text-center text-3xl font-extrabold text-[#ff6422]">{cms("f42")}</h2>
        <p className="mb-10 text-center text-gray-500">{cms("f43")}</p>

        <div className="grid gap-6 md:grid-cols-2">
          {hosts.map(host => <div key={host.name} className="overflow-hidden rounded-md border border-gray-200">
              <div className="flex items-center gap-4 bg-[#ff6422] p-6">
                <div aria-hidden="true" className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-white text-3xl font-extrabold text-[#ff6422]">
                  {host.name[0]}
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wide text-white/80">{host.role}</p>
                  <p className="text-2xl font-bold text-white">{host.name}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6">
                {host.bio.map((paragraph, i) => <p key={i} className="mb-4 leading-relaxed text-gray-700">
                    {paragraph}
                  </p>)}

                <div className="mb-4 rounded-md bg-orange-100 px-5 py-4 font-semibold text-gray-900">
                  {host.quote}
                </div>

                <p className="leading-relaxed text-gray-700">{host.closing}</p>
              </div>
            </div>)}
        </div>
      </section>

      {/* Season 1 Episodes */}
      <PostList title="Season 1 episodes" type="video" category="Chai Pe Charcha" />

      {/* Have a question for a future episode? */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-10 rounded-md border border-gray-200 bg-gray-50 p-8 md:grid-cols-2">
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
