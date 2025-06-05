import ReactMarkdown from 'react-markdown';

export default function PostContent({ content }) {
  return (
    <article className="prose prose-invert max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );
}
