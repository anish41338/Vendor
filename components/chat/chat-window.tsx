// components/chat/chat-window.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Message = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { username: string; avatar_url: string } | null;
}

interface ChatWindowProps {
  groupId: number;
}

export default function ChatWindow({ groupId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getUser()
  }, [supabase])

  // Scroll to the bottom of the chat on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(username, avatar_url)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
      }
      if (error) console.error('Error fetching messages:', error)
    }
    fetchMessages()
  }, [groupId, supabase])

  // Listen for new messages in real-time
  useEffect(() => {
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
        async (payload) => {
          // Fetch the new message with the profile data
          const { data: newMessageData, error } = await supabase
            .from('messages')
            .select('*, profiles(username, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (newMessageData) setMessages((prevMessages) => [...prevMessages, newMessageData])
          if (error) console.error('Error fetching new message profile:', error)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    const content = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase
      .from('messages')
      .insert({ content, group_id: groupId, user_id: currentUser.id })

    if (error) {
      console.error('Error sending message:', error)
      setNewMessage(content) // Restore message on failure
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] border rounded-lg">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.user_id === currentUser?.id ? 'flex-row-reverse' : ''
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.profiles?.avatar_url} />
              <AvatarFallback>{message.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div
              className={`p-3 rounded-lg max-w-xs ${
                message.user_id === currentUser?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              <p className="text-sm font-bold mb-1">{message.profiles?.username}</p>
              <p>{message.content}</p>
              <p className="text-xs opacity-70 mt-1">{new Date(message.created_at).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message for bulk ordering..."
            className="flex-1"
            rows={1}
          />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  )
}