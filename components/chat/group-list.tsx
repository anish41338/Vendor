// components/chat/group-list.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Group = {
  id: number;
  name: string;
}

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase.from('groups').select('*')
      if (data) {
        setGroups(data)
      }
      if(error) console.error(error)
      setLoading(false)
    }
    fetchGroups()
  }, [supabase])

  if (loading) return <p>Loading your groups...</p>
  if (groups.length === 0) return <p>You are not in any groups yet. Find nearby vendors to create one!</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Group Chats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {groups.map(group => (
            <Link key={group.id} href={`/group-chat/${group.id}`} passHref>
              <div className="block p-3 border rounded-md hover:bg-gray-100 cursor-pointer">
                {group.name}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}