import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";
import PageHero from "../components/PageHero";
export default function ConnectPage() {
  const cms = useSection("ConnectPage");
  const heroBanner = cms("f1");
  const socials = [{
    label: cms("f2"),
    href: cms("f3"),
    Icon: FaInstagram
  }, {
    label: cms("f4"),
    href: cms("f5"),
    Icon: FaFacebookF
  }, {
    label: cms("f6"),
    href: cms("f7"),
    Icon: FaYoutube
  }, {
    label: cms("f8"),
    href: cms("f9"),
    Icon: FaXTwitter
  }];
  return <SectionBoundary name="ConnectPage"><>
      <PageHero title={cms("f10")} image={heroBanner} />

      {/* Get in Touch / Speaking & Interview Requests */}
      <section className="bg-[#f3f8fc] py-12 sm:py-16">
        <div className="page-wrap">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
              <h2 className="mb-4 text-2xl font-extrabold text-[#ff6422] sm:text-3xl">{cms("f11")}</h2>
              <p className="mb-4 max-w-2xl text-base leading-7 text-slate-700">{cms("f12")}</p>
              <p className="max-w-2xl border-t border-slate-200 pt-4 leading-7 text-slate-700">{cms("f15")}</p>
            </div>

            <div className="flex flex-col rounded-3xl bg-[#10283d] p-7 text-white shadow-sm sm:p-9">
              <div>
                <span aria-hidden="true" className="mb-5 block h-1 w-12 rounded-full bg-[#ff6422]" />
                <h2 className="mb-6 text-2xl font-extrabold sm:text-3xl">{cms("f13")}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
              {socials.map(({
                label,
                href,
                Icon
              }) => <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-sm font-semibold text-white transition hover:border-[#ff6422]/70 hover:bg-white/10">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ff6422] text-white">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="truncate">{label}</span>
                </a>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </></SectionBoundary>;
}
