// components/chat/vendor-location.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from '@supabase/supabase-js'

type VendorProfile = {
  id: string;
  username: string;
  avatar_url: string;
}

export default function VendorLocation() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [vendors, setVendors] = useState<VendorProfile[]>([])
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set())
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getUser()
  }, [supabase])

  const findAndSetNearbyVendors = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords

      // First, update the current user's location
      if(currentUser) {
        await supabase.from('profiles').update({ location: `POINT(${longitude} ${latitude})` }).eq('id', currentUser.id)
      }

      // Then, find nearby vendors using the RPC function
      const { data, error } = await supabase.rpc('find_nearby_vendors', { lat: latitude, long: longitude })
      console.log('Vendors found:', data)
      if (error) {
        console.error('Error finding vendors:', error)
        alert('Could not find nearby vendors.')
      } else if (data) {
        // Filter out the current user from the list
        setVendors(data.filter((v: VendorProfile) => v.id !== currentUser?.id));
      }
      setLoading(false)
    }, () => {
      alert("Unable to retrieve your location.")
      setLoading(false)
    })
  }

  const handleVendorSelect = (vendorId: string) => {
    setSelectedVendors(prev => {
      const newSet = new Set(prev)
      if (newSet.has(vendorId)) {
        newSet.delete(vendorId)
      } else {
        newSet.add(vendorId)
      }
      return newSet
    })
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedVendors.size === 0 || !currentUser) {
      alert('Please enter a group name and select at least one vendor.')
      return
    }

    // 1. Create the group but DON'T try to read it back yet
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({ name: groupName, created_by: currentUser.id })
      .select('id') // Just select the ID
      .single()

    if (groupError || !groupData) {
      console.error('Error creating group:', groupError)
      alert('Failed to create group. Check the console for errors.')
      return
    }

    // 2. Add members to the group
    const members = [...selectedVendors, currentUser.id].map(userId => ({
      group_id: groupData.id,
      user_id: userId,
    }))

    const { error: membersError } = await supabase.from('group_members').insert(members)

    if (membersError) {
      alert('Failed to add members to the group.')
      console.error('Error adding members:', membersError)
    } else {
      alert(`Group "${groupName}" created successfully! Please refresh the page to see it in your list.`)
      // Reload the page to see the new group
      window.location.reload()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Vendors & Create Group</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={findAndSetNearbyVendors} disabled={loading}>
          {loading ? 'Finding...' : 'Find Nearby Vendors'}
        </Button>

        {vendors.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Select vendors to create a group:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
              {vendors.map(vendor => (
                <div
                  key={vendor.id}
                  onClick={() => handleVendorSelect(vendor.id)}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    selectedVendors.has(vendor.id) ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedVendors.has(vendor.id)}
                    readOnly
                    className="mr-3"
                  />
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={vendor.avatar_url} />
                    <AvatarFallback>{vendor.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{vendor.username || 'Unnamed Vendor'}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter Group Name (e.g., 'Aminabad Potato Deal')"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full p-2 border rounded-md mb-2"
              />
              <Button onClick={handleCreateGroup} disabled={selectedVendors.size === 0 || !groupName.trim()}>
                Create Group Chat
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}