'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

interface Message {
  id: number;
  content: string;
  sender_id: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    supabase
      .from('chat_messages')
      .select('*')
      .order('id', { ascending: true })
      .then(({ data }) => setMessages(data as Message[]));

    const channel = supabase
      .channel('realtime_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        payload => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const send = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !text) return;
    await supabase.from('chat_messages').insert({ content: text });
    setText('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Chat communautaire</h1>
      <div className="h-64 overflow-y-auto bg-gray-800 p-4 mb-2 rounded">
        {messages.map(msg => (
          <p key={msg.id}>{msg.content}</p>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} className="flex-grow p-2 text-black" />
        <button onClick={send} className="bg-neonpink px-4 py-2 text-darkblack">Envoyer</button>
      </div>
    </div>
  );
}
