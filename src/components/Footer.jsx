import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";
export default function Footer() {
  const cms = useSection("Footer");
  const socialLinks = [{
    name: cms("f15"),
    href: cms("f16"),
    Icon: FaInstagram
  }, {
    name: cms("f17"),
    href: cms("f18"),
    Icon: FaFacebookF
  }, {
    name: cms("f19"),
    href: cms("f20"),
    Icon: FaYoutube
  }, {
    name: cms("f21"),
    href: cms("f22"),
    Icon: FaXTwitter
  }];
  const quickLinks = [{
    name: "About me",
    href: cms("f2")
  }, {
    name: "My journey",
    href: cms("f4")
  }, {
    name: "Thought leadership",
    href: cms("f6")
  }, {
    name: "Sewa",
    href: cms("f8")
  }, {
    name: "Youth connect",
    href: cms("f10")
  }, {
    name: "Contact",
    href: cms("f12")
  }];
  return <SectionBoundary name="Footer"><footer className="bg-[#fff7f4] py-8 sm:py-10">
      <div className="page-wrap">
        <div className="flex flex-col gap-5 border-b border-orange-200 py-5 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="normal-case text-xl font-extrabold text-[#f05d25]">Subscribe to Our Newsletter</h2>
          <form className="flex w-full max-w-xl" onSubmit={e => e.preventDefault()}>
            <input type="email" required placeholder={cms("f24")} className="min-w-0 flex-1 rounded-l-md border border-r-0 border-orange-200 bg-white px-5 py-3 outline-none focus:border-[#ff6422]" />
            <button className="rounded-r-md bg-[#ff6422] px-5 py-3 text-sm font-bold text-white">{cms("f25")}</button>
          </form>
        </div>

        <div className="grid gap-10 border-b border-orange-200 py-8 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.95fr] lg:gap-16">
          <div>
            <h2 className="text-2xl font-extrabold text-[#f05d25]">Learning. Leading. Giving Back.</h2>
            {cms("f29") && <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-7 text-slate-700">{cms("f29")}</p>}
          </div>
          <div className="mx-auto w-fit text-left">
            <h3 className="text-lg font-bold text-[#10283d]">Quick links</h3>
            <nav aria-label="Quick links" className="mt-2 grid grid-cols-1 justify-items-start gap-y-3 text-left text-sm text-slate-700">
              {quickLinks.map(item => <Link key={item.name} to={item.href} className="transition-colors hover:text-[#ff6422]">{item.name}</Link>)}
            </nav>
          </div>
          {cms("f30") && <div>
            <h3 className="text-xl font-bold text-[#10283d]">Let's stay connected</h3>
            <p className="mt-3 text-sm leading-7 text-slate-700">{cms("f31")}</p>
            {cms("f32") && <Link to={cms("f33")} className="mt-5 inline-flex rounded-full bg-[#ff6422] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e95318]">
              Connect with me
            </Link>}
          </div>}
        </div>

        <div className="flex flex-col gap-4 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-slate-600 sm:text-left">Copyright © 2026 Shailendra Bhadauria. All rights reserved.</p>
          <div className="flex justify-center gap-3 sm:justify-end">
            {socialLinks.map(({
              name,
              href,
              Icon
            }) => <a href={href} key={name} aria-label={name} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-[#ff6422] text-[#ff6422] transition-colors hover:bg-[#ff6422] hover:text-white">
                <Icon aria-hidden="true" />
            </a>)}
          </div>
        </div>
      </div>
    </footer></SectionBoundary>;
}
