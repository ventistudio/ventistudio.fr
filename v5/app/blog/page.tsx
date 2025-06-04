import Link from 'next/link';

const posts = [
  { slug: 'premier-article', title: 'Premier article', excerpt: 'Introduction au projet.' },
  { slug: 'second-article', title: 'Second article', excerpt: 'Suite du développement.' }
];

export default function BlogPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Blog</h1>
      {posts.map(post => (
        <Link key={post.slug} href={`/blog/${post.slug}`} className="block bg-gray-800 p-4 rounded mb-4 hover:bg-gray-700">
          <h2 className="text-neonpink text-xl">{post.title}</h2>
          <p>{post.excerpt}</p>
        </Link>
      ))}
    </div>
  );
}
