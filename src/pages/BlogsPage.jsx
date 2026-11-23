import { PostList } from "../cms/PublicCMS";
import blogsImage from "../assets/WebImages/Letters to Young India.jpg";

export default function BlogsPage() {
  return <>
    <section className="page-hero relative isolate h-[220px] overflow-hidden bg-[#10283d] sm:h-[280px]">
      <img src={blogsImage} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10283d]/85 via-[#10283d]/55 to-[#10283d]/15" />
      <div className="page-wrap flex h-full items-end pb-8 sm:pb-10">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-md sm:text-5xl">Blogs</h1>
      </div>
    </section>
    <PostList type="article" title="Blogs" limit={9} hideTitle />
  </>;
}
