import { notFound } from 'next/navigation';
import PostContent from '../../../components/PostContent';
import Comments from '../../../components/Comments';

const posts = [
  { slug: 'premier-article', title: 'Premier article', content: '# Introduction\nContenu de l\'article.' },
  { slug: 'second-article', title: 'Second article', content: '# Suite\nContenu suivant.' }
];

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = posts.find(p => p.slug === params.slug);
  if (!post) return notFound();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-neonpink">{post.title}</h1>
      <PostContent content={post.content} />
      <Comments />
    </div>
  );
}
