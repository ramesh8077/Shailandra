import { PostList } from '../cms/PublicCMS';

export default function Blogs() {
  return <>
    <PostList title="Blogs & Articles" limit={6} />
  </>;
}
