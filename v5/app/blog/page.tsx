import Link from 'next/link';
import { supabase } from '../../supabase';

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Blog</h1>
      {posts && posts.length > 0 ? (
        posts.map(post => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block bg-gray-800 p-4 rounded mb-4 hover:bg-gray-700"
          >
            <h2 className="text-neonpink text-xl">{post.title}</h2>
            <p>{post.excerpt}</p>
          </Link>
        ))
      ) : (
        <p>Aucun article pour le moment.</p>
      )}
    </div>
  );
}
