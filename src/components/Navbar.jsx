import { SectionBoundary } from "../cms/PublicCMS";
import { useSection } from "../cms/contentContext";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
export default function Navbar() {
  const cms = useSection("Navbar");
  const ShalinderImg = cms("f1");
  const links = [{
    label: cms("f2"),
    path: cms("f3")
  }, {
    label: cms("f4"),
    path: cms("f5")
  }, {
    label: cms("f6"),
    path: cms("f7")
  }, {
    label: cms("f8"),
    path: cms("f9")
  }, {
    label: cms("f10"),
    path: cms("f11")
  }, {
    label: cms("f12"),
    path: cms("f13")
  }];
  const moreLinks = [{
    label: cms("f14"),
    path: cms("f15")
  }, {
    label: cms("f16"),
    path: cms("f17")
  }, {
    label: "Coffee Pe Charcha",
    path: cms("f19")
  }, {
    label: cms("f20"),
    path: cms("f21")
  }, {
    label: cms("f22"),
    path: cms("f23")
  }];
  const [open, setOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [desktopMoreOpen, setDesktopMoreOpen] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 1280px)").matches
  );
  const location = useLocation();
  const moreRef = useRef(null);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const updateViewport = event => {
      setIsWideScreen(event.matches);
      if (event.matches) {
        setOpen(false);
        setMobileMoreOpen(false);
      }
    };
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);
  useEffect(() => {
    setOpen(false);
    setMobileMoreOpen(false);
    setDesktopMoreOpen(false);
  }, [location.pathname, location.hash]);
  useEffect(() => {
    function handleClickOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setDesktopMoreOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setDesktopMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);
  const isLinkActive = path => location.pathname === path;
  const isMoreActive = moreLinks.some(link => isLinkActive(link.path));
  return <SectionBoundary name="Navbar"><header className="sticky top-0 z-50 border-b border-slate-100 bg-white shadow-[0_4px_18px_rgba(15,39,59,0.05)]">
      <div className="mx-auto flex h-[76px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:h-[84px] sm:px-6 lg:px-8 2xl:h-[96px] 2xl:px-10">
        {/* Logo */}
        <Link to={cms("f24")} aria-label="Shailendra Bhadauria Home" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex h-[54px] w-[46px] shrink-0 items-end justify-center overflow-hidden sm:h-[64px] sm:w-[56px] 2xl:h-[76px] 2xl:w-[66px]">
            <img src={ShalinderImg} alt={cms("f25")} className="h-full w-full object-contain object-bottom rotate-6 -scale-x-100 " />
          </div>

          <div className="leading-none">
            <strong className="block text-[15px] font-bold tracking-[-0.02em] text-[#ff6422] sm:text-[18px] 2xl:text-[21px]">{cms("f26")}</strong>
            <span className="mt-1 block text-[13px] font-medium tracking-[-0.01em] text-[#ff6422] sm:text-[16px] 2xl:text-[18px]">{cms("f27")}</span>
          </div>
        </Link>

        {/* Wide-screen navigation */}
        <nav aria-label="Main navigation" className="hidden min-w-0 items-center gap-4 xl:flex 2xl:gap-5">
          {links.map(link => <Link key={link.path} to={link.path} aria-current={isLinkActive(link.path) ? "page" : undefined} className={`whitespace-nowrap py-3 text-[14px] font-medium transition-colors hover:text-[#ff6422] ${isLinkActive(link.path) ? "font-semibold text-[#ff6422]" : "text-[#536170]"}`}>
              {link.label}
            </Link>)}

          <div className="relative" ref={moreRef}>
            <button type="button" onClick={() => {
              setOpen(false);
              setMobileMoreOpen(false);
              setDesktopMoreOpen(previous => !previous);
            }} aria-expanded={desktopMoreOpen} aria-controls="desktop-more-menu" className={`flex items-center gap-1 whitespace-nowrap py-3 text-[14px] font-medium transition-colors hover:text-[#ff6422] ${isMoreActive || desktopMoreOpen ? "font-semibold text-[#ff6422]" : "text-[#536170]"}`}>{cms("f28")}<svg viewBox="0 0 20 20" fill="none" className={`h-4 w-4 transition-transform ${desktopMoreOpen ? "rotate-180" : ""}`} aria-hidden="true">
                <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {desktopMoreOpen && <div id="desktop-more-menu" className="absolute right-0 top-full z-20 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
                {moreLinks.map(link => <Link key={link.path} to={link.path} aria-current={isLinkActive(link.path) ? "page" : undefined} className={`block px-5 py-3 text-sm font-medium transition-colors ${isLinkActive(link.path) ? "bg-orange-50 font-semibold text-[#ff6422]" : "text-[#536170] hover:bg-orange-50 hover:text-[#ff6422]"}`}>
                    {link.label}
                  </Link>)}
              </div>}
          </div>
        </nav>

        <Link to={cms("f29")} className="hidden shrink-0 justify-center rounded-full bg-[#ff6422] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ea5318] xl:inline-flex 2xl:px-7">{cms("f30")}</Link>

        {/* Menu button for phones, tablets, and narrower laptops */}
        <button type="button" onClick={() => {
          setDesktopMoreOpen(false);
          setOpen(previous => !previous);
        }} aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="mobile-navigation" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 text-[#10283d] transition hover:border-[#ff6422] hover:text-[#ff6422] xl:hidden">
          {open ? <span className="text-3xl leading-none" aria-hidden="true">
              ×
            </span> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>}
        </button>
      </div>

      {/* Scrollable menu: no fixed height cutting off pages */}
      {open && !isWideScreen && <div id="mobile-navigation" className="max-h-[calc(100dvh-76px)] overflow-y-auto overscroll-contain border-t border-slate-100 bg-white sm:max-h-[calc(100dvh-84px)] xl:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto w-full max-w-[1600px] px-4 pb-6 pt-2 sm:px-6 lg:px-8">
            {links.map(link => <Link key={link.path} to={link.path} aria-current={isLinkActive(link.path) ? "page" : undefined} className={`block border-b border-slate-100 px-2 py-3.5 text-sm font-semibold ${isLinkActive(link.path) ? "text-[#ff6422]" : "text-[#536170] hover:text-[#ff6422]"}`}>
                {link.label}
              </Link>)}

            <button type="button" onClick={() => setMobileMoreOpen(previous => !previous)} aria-expanded={mobileMoreOpen} aria-controls="mobile-more-menu" className={`flex w-full items-center justify-between border-b border-slate-100 px-2 py-3.5 text-left text-sm font-semibold ${isMoreActive ? "text-[#ff6422]" : "text-[#536170] hover:text-[#ff6422]"}`}>{cms("f31")}<svg viewBox="0 0 20 20" fill="none" className={`h-4 w-4 transition-transform ${mobileMoreOpen ? "rotate-180" : ""}`} aria-hidden="true">
                <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {mobileMoreOpen && <div id="mobile-more-menu">
                {moreLinks.map(link => <Link key={link.path} to={link.path} aria-current={isLinkActive(link.path) ? "page" : undefined} className={`block border-b border-slate-100 bg-slate-50 px-6 py-3 text-sm font-medium ${isLinkActive(link.path) ? "text-[#ff6422]" : "text-[#536170] hover:text-[#ff6422]"}`}>
                    {link.label}
                  </Link>)}
              </div>}

            <Link to={cms("f32")} className="mt-5 flex w-full justify-center rounded-full bg-[#ff6422] px-7 py-3.5 text-sm font-bold text-white hover:bg-[#ea5318]">{cms("f33")}</Link>
          </nav>
        </div>}
    </header></SectionBoundary>;
}
