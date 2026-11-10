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
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f11")}</h2>
            <p className="mb-4 leading-relaxed text-gray-700">{cms("f12")}</p>
            <p className="mb-8 leading-relaxed text-gray-700">{cms("f15")}</p>

            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f13")}</h2>
            <div className="flex flex-wrap items-center gap-3">
              {socials.map(({
                label,
                href,
                Icon
              }) => <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="grid h-11 w-11 place-items-center rounded-full border border-gray-800 text-gray-800 transition hover:border-[#ff6422] hover:text-[#ff6422]">
                  <Icon aria-hidden="true" />
                </a>)}
            </div>
        </div>
      </section>
    </></SectionBoundary>;
}
