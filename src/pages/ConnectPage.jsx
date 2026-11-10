import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { useState } from "react";
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";
import PageHero from "../components/PageHero";
import Blogs from "../components/Blogs";
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
  const [form, setForm] = useState({
    name: "",
    organisation: "",
    topic: "",
    message: ""
  });
  function handleChange(field) {
    return e => setForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    // TODO: wire this up to your form-handling endpoint
  }
  return <SectionBoundary name="ConnectPage"><>
      <PageHero title={cms("f10")} image={heroBanner} />

      {/* Get in Touch / Speaking & Interview Requests */}
      <Blogs />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Left column */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f11")}</h2>
            <p className="mb-8 leading-relaxed text-gray-700">{cms("f12")}</p>

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

          {/* Right column: form */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#ff6422]">{cms("f14")}</h2>
            <p className="mb-8 leading-relaxed text-gray-700">{cms("f15")}</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <label className="text-sm font-bold text-gray-900">{cms("f16")}<input type="text" required placeholder={cms("f17")} value={form.name} onChange={handleChange("name")} className="mt-2 w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none" />
              </label>

              <label className="text-sm font-bold text-gray-900">{cms("f18")}<input type="text" required placeholder={cms("f19")} value={form.organisation} onChange={handleChange("organisation")} className="mt-2 w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none" />
              </label>

              <label className="text-sm font-bold text-gray-900">{cms("f20")}<input type="text" required placeholder={cms("f21")} value={form.topic} onChange={handleChange("topic")} className="mt-2 w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none" />
              </label>

              <label className="text-sm font-bold text-gray-900">{cms("f22")}<textarea required rows={3} placeholder={cms("f23")} value={form.message} onChange={handleChange("message")} className="mt-2 w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none" />
              </label>

              <button type="submit" className="mt-2 rounded-md bg-[#ff6422] px-5 py-4 text-sm font-bold text-white">{cms("f24")}</button>
            </form>
          </div>
        </div>
      </section>
    </></SectionBoundary>;
}
