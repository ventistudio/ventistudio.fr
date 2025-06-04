'use client';
import Link from 'next/link';
import LoginButton from './LoginButton';

export default function Navbar() {
  return (
    <nav className="bg-darkblack text-neonpink p-4 flex justify-between">
      <div className="flex gap-4">
        <Link href="/">Accueil</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/chat">Chat</Link>
      </div>
      <LoginButton />
    </nav>
  );
}
