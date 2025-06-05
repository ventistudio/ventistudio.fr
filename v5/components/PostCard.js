export default function PostCard({ title, excerpt }) {
  return (
    <div className="bg-gray-700 p-4 rounded mb-4">
      <h2 className="text-xl font-bold text-neonpink mb-2">{title}</h2>
      <p>{excerpt}</p>
    </div>
  );
}
