'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!postId) return;
    supabase
      .from('comments')
      .select('id, content, created_at, profiles(username)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setComments(data || []));

    const channel = supabase
      .channel('comments-' + postId)
      .on(
        'postgres_changes',
        { event: 'INSERT', table: 'comments', filter: `post_id=eq.${postId}` },
        payload => {
          setComments(comments => [...comments, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim()) return;
    await supabase.from('comments').insert({ post_id: postId, content });
    setContent('');
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2">Commentaires</h3>
      {comments.map(c => (
        <div key={c.id} className="mb-2 p-2 bg-gray-800 rounded">
          <p className="text-sm text-neonblue">{c.profiles?.username}</p>
          <p>{c.content}</p>
        </div>
      ))}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          className="flex-grow p-2 bg-gray-900 rounded"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Votre commentaire..."
        />
        <button type="submit" className="px-4 bg-neonpink text-darkblack rounded">
          Envoyer
        </button>
      </form>
    </div>
  );
}
