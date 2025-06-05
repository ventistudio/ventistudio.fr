import { notFound } from 'next/navigation';
import PostContent from '../../../components/PostContent';
import Comments from '../../../components/Comments';
import { supabase } from '../../../supabase';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { data: post } = await supabase
    .from('posts')
    .select('id, title, content')
    .eq('slug', params.slug)
    .eq('published', true)
    .single();

  if (!post) return notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-neonpink">{post.title}</h1>
      <PostContent content={post.content} />
      <Comments postId={post.id} />
    </div>
  );
}
