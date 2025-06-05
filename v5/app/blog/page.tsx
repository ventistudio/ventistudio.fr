import Link from 'next/link';
import { supabase } from '../../supabase';
import PostCard from '../../components/PostCard';

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Blog</h1>
      {posts && posts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`}> 
              <PostCard title={post.title} excerpt={post.excerpt} />
            </Link>
          ))}
        </div>
      ) : (
        <p>Aucun article pour le moment.</p>
      )}
    </section>
  );
}
