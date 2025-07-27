// components/ExcessFoodListener.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { User, MapPin, Inbox } from "lucide-react"; // Importing icons

// Helper function to calculate distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

type Profile = {
  username: string;
};

type Alert = {
  id: number;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
  profiles: Profile | null;
};

export function ExcessFoodListener() {
  const supabase = createClient();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => toast.error("Unable to get your location for food alerts.")
      );
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const fetchInitialAlerts = async () => {
      const { data, error } = await supabase
        .from("excess_food_alerts")
        .select("*, profiles(username)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const nearbyAlerts = data.filter((alert) =>
          getDistanceFromLatLonInKm(userLocation.lat, userLocation.lon, alert.latitude, alert.longitude) <= 10
        );
        setAlerts(nearbyAlerts);
      }
    };

    fetchInitialAlerts();

    const channel = supabase
      .channel("realtime-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "excess_food_alerts" },
        () => {
          // Re-fetch the list to get all data including the profile name
          fetchInitialAlerts(); 
          toast.success("New nearby excess food alert!");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userLocation, supabase]);

  if (!userLocation) return <p>Getting your location...</p>;
  
  // A much nicer "empty state" when there are no alerts
  if (alerts.length === 0) {
    return (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <Inbox className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Nearby Alerts</h3>
            <p className="mt-1 text-sm text-muted-foreground">Check back later or create a new alert above.</p>
        </div>
    );
  }

  return (
    <ul className="space-y-4">
      {alerts.map((alert) => (
        <li
          key={alert.id}
          // Using theme variables for styling
          className="bg-card border p-4 rounded-lg shadow-sm"
        >
          <div className="flex items-center font-bold text-lg mb-2">
            <User className="w-5 h-5 mr-2 text-primary" />
            <span>{alert.profiles?.username || "Unknown Vendor"}</span>
          </div>
          
          <p className="text-card-foreground my-2">{alert.description}</p>
          
          <div className="text-sm text-muted-foreground flex items-center justify-between mt-4">
            <span>Posted at: {new Date(alert.created_at).toLocaleTimeString()}</span>
            <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1"/>
                {alert.latitude.toFixed(2)}, {alert.longitude.toFixed(2)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}