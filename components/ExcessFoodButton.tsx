// components/ExcessFoodButton.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client' // 1. Using the consistent client
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea' // 2. Using the styled Textarea
import { toast } from 'react-hot-toast'
import { Send } from 'lucide-react' // 3. Importing an icon

export function ExcessFoodButton() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');

  const handleSendAlert = () => {
    if (!description.trim()) {
      toast.error('Please enter a description for the excess food.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      // Success Callback
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase.from('excess_food_alerts').insert({
          vendor_id: user?.id,
          description,
          latitude,
          longitude,
        });

        setLoading(false);
        if (error) {
          toast.error('Failed to send alert. Please try again.');
          console.error('Supabase error:', error);
          return;
        }
        
        toast.success('Alert sent to nearby vendors!');
        setDescription('');
      },
      // Error Callback
      (err) => {
        setLoading(false);
        toast.error("Location access denied. Could not send alert.");
        console.error("Geolocation error:", err);
      }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Describe your excess food (e.g. 10kg potatoes, 5 loaves bread, etc.)"
        rows={3}
      />
      <Button onClick={handleSendAlert} disabled={loading}>
        {loading ? 'Sending...' : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Notify Nearby Vendors
          </>
        )}
      </Button>
    </div>
  );
}