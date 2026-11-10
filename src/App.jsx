import { createBrowserRouter, RouterProvider, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../src/components/Navbar";
import Hero from "../src/components/Hero";
import Journey from "../src/components/Journey";
import Stats from "../src/components/Stats";
import Features from "../src/components/Features";
import YouthConnect from "../src/components/YouthConnect";
import ContactInsights from "../src/components/ContactInsights";
import Blogs from "../src/components/Blogs";
import SiteFAQs from "../src/components/SiteFAQs";
import Footer from "../src/components/Footer";
import JourneyPage from "./pages/JourneyPage";
import EducationPage from "./pages/EducationPage";
import SewaPage from "./pages/Sewapage";
import SportsPage from "./pages/Sportspage";
import Vision2047Page from "./pages/vision2047";
import ThoughtLeadershipPage from "./pages/Thoughtleadershippage";
import UpDevelopmentPage from "./pages/Updevelopmentpage";
import ChaiPaiCharchaPage from "./pages/ChaiPaiCharchaPage";
import Connectpage from "./pages/ConnectPage";
import NationBuildingPage from "./pages/Nationbuildingpage";
import MediaPage from "./pages/Mediapage";
import { PublicCMS, PostDetail, PostList } from './cms/PublicCMS';
import Admin from './cms/Admin';
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => {
        let target=hash.slice(1);
        try { target=decodeURIComponent(target); } catch { /* Keep malformed fragments harmless. */ }
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
 function HomePage() {
   return (
     <main>
       <Hero />
       <Journey />
       <Stats />
       <Features />
       <YouthConnect />
     </main>
   );
 }
 
 function PublicSite() {
   const { pathname } = useLocation();
   const hasArticleListing = pathname === "/posts";
   return (
     <PublicCMS>
       <ScrollToTop />
       <div className="public-site min-h-screen bg-white text-[#10283d]">
         <Navbar />
         <Routes>
<Route path="/posts/:slug" element={<PostDetail />} />
<Route path="/posts" element={<PostList title="Blogs & Articles" />} />
           <Route path="/" element={<HomePage />} />
           <Route path="/journey" element={<JourneyPage />} />
           <Route path="/education" element={<EducationPage />} />
           <Route path="/sewa" element={<SewaPage />} />
           <Route path="/sports" element={<SportsPage />} />
           <Route path="/vision-2047" element={<Vision2047Page />} />
           <Route path="/thought-leadership" element={<ThoughtLeadershipPage />} />
           <Route path="/updevelopment" element={<UpDevelopmentPage />} />
           <Route path="/coffe-pai-charcha" element={<ChaiPaiCharchaPage />} />
           <Route path="/coffee-pe-charcha" element={<ChaiPaiCharchaPage />} />
           <Route path="/चाय-पै-चर्चा" element={<ChaiPaiCharchaPage />} />
           <Route path="/connect" element={<Connectpage />} />
           <Route path="/nation-building" element={<NationBuildingPage />} />
           <Route path="/media" element={<MediaPage />} />
         </Routes>
         {!hasArticleListing && <Blogs />}
         <SiteFAQs />
         <ContactInsights />
         <Footer />
       </div>
     </PublicCMS>
   );
 }
 
function AppRoutes(){return <Routes><Route path="/admin/*" element={<Admin/>}/><Route path="*" element={<PublicSite/>}/></Routes>;}
const router=createBrowserRouter([{path:'*',element:<AppRoutes/>}]);
export default function App(){return <RouterProvider router={router}/>;}
