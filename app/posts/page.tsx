import { getPostsIndex } from '@/lib/parsePost';
import PostsWithSearch from './PostsWithSearch';

export default function PostsPage() {
  const posts = getPostsIndex();
  return <PostsWithSearch initialPosts={posts} />;
}
