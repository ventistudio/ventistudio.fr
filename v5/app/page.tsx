export default function HomePage() {
  return (
    <section className="text-center py-24 bg-gradient-to-b from-darkblack to-gray-900 animate-fade-in">
      <h1 className="text-5xl font-bold text-neonpink mb-6 drop-shadow">Bienvenue sur VentiStudio v5</h1>
      <p className="mb-8 text-lg">Une refonte Web3.0 inspirée du Japon.</p>
      <a
        href="/blog"
        className="inline-block px-8 py-3 bg-neonpink text-darkblack rounded hover:bg-neonblue transition"
      >
        Découvrir le blog
      </a>
    </section>
  );
}
