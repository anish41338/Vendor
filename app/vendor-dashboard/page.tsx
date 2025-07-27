// app/vendor-dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

type Alert = {
  id: number;
  description: string;
  location: string;
  created_at: string;
  latitude: number;
  longitude: number;
};

export default function VendorDashboardPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const supabaseClient = createClientComponentClient();
    supabaseClient.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/login");
    });
  }, [router]);

  // Get user's geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLat(latitude);
        setUserLon(longitude);
        setLoading(false);
      },
      (err) => {
        alert("Geolocation permission is required to receive alerts.");
        setLoading(false);
      }
    );
  }, []);

  // Calculate distance in km using Haversine formula
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  // Subscribe to nearby alerts
  useEffect(() => {
    if (userLat == null || userLon == null) return;

    const channel = supabase
      .channel("realtime:alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "excess_food_alerts" },
        (payload) => {
          const newAlert = payload.new as Alert;
          const dist = getDistance(userLat, userLon, newAlert.latitude, newAlert.longitude);
          if (dist <= 5) {
            setAlerts((prev) => [newAlert, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userLat, userLon]);

  if (loading) return <p className="text-center p-4">Getting your location...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">📢 Excess Food Notifications Nearby</h1>
      {alerts.length === 0 ? (
        <p>No recent alerts near you.</p>
      ) : (
        <ul className="space-y-4">
          {alerts.map((alert) => (
            <li key={alert.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold text-lg">{alert.description}</h3>
              <p>📍 {alert.location}</p>
              <p className="text-sm text-gray-500">
                {new Date(alert.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
