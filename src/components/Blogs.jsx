import { PostList } from '../cms/PublicCMS';
import { useLocation } from 'react-router-dom';

export default function Blogs() {
  const { pathname } = useLocation();

  return <>
    <PostList title="Blogs & Articles" limit={6} />
    {pathname === '/nation-building' && <PostList title="In the Room" type="news" />}
  </>;
}
