'use client';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface Message {
  id: number;
  content: string;
  profiles?: {
    username: string;
  } | null;
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    supabase
      .from('chat_messages')
      .select('id, content, created_at, profiles(username)')
      .eq('room_id', 'general')
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages((data as unknown as Message[]) || []));

    const channel = supabase
      .channel('chat-general')
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', table: 'chat_messages', filter: 'room_id=eq.general' },
        (payload: any) => {
          setMessages(msgs => [...msgs, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await supabase.from('chat_messages').insert({ room_id: 'general', content: text });
    setText('');
  };

  return (
    <div className="p-4 bg-gray-700 rounded flex flex-col h-96">
      <div className="flex-grow overflow-y-auto mb-2 space-y-2">
        {messages.map(m => (
          <div key={m.id} className="bg-gray-800 p-2 rounded">
            <span className="text-neonblue text-sm mr-2">{m.profiles?.username}</span>
            {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-grow p-2 bg-gray-900 rounded"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Votre message..."
        />
        <button type="submit" className="px-4 bg-neonpink text-darkblack rounded">
          Envoyer
        </button>
      </form>
    </div>
  );
}
