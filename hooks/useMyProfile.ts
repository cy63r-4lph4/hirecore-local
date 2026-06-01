"use client";

import { useEffect, useState } from "react";
import { getMyProfile } from "@/lib/api/users";

export function useMyProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    getMyProfile()
      .then((data) => alive && setProfile(data))
      .catch((err) => alive && setError(err.response?.data?.message || "Could not load profile"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  return { profile, loading, error, setProfile };
}