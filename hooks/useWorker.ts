"use client";

import { useEffect, useMemo, useState } from "react";
import { getPublicProfile } from "@/lib/api/workers";

export type NormalizedWorkerProfile = {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  accountTypes: string[];

  bio: string | null;
  skills: string[];
  location: string | null;

  isAvailable: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  isWorkforceMember: boolean;

  trustScore: number | null;

  joinedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;

  raw: any;
};

function normalizeWorkerProfile(response: any): NormalizedWorkerProfile | null {
  const workerProfile = response?.workerProfile;

  if (!response || !workerProfile) {
    return null;
  }

  return {
    id: response.id,
    fullName: response.fullName || "Unnamed worker",
    profileImageUrl: response.profileImageUrl ?? null,

    accountTypes: response.accountTypes ?? [],

    bio: workerProfile.bio ?? null,
    skills: Array.isArray(workerProfile.skills) ? workerProfile.skills : [],
    location: workerProfile.location ?? null,

    isAvailable: Boolean(workerProfile.isAvailable),
    isVerified: Boolean(workerProfile.isVerified),
    verifiedAt: workerProfile.verifiedAt ?? null,
    isWorkforceMember: Boolean(workerProfile.isWorkforceMember),

    trustScore:
      response?.trust?.workerScore ??
      workerProfile.trustScore ??
      response?.trust?.score ??
      null,

    joinedAt: response.joinedAt ?? null,
    createdAt: workerProfile.createdAt ?? null,
    updatedAt: workerProfile.updatedAt ?? null,

    raw: response,
  };
}

export function useWorker(id?: string) {
  const [worker, setWorker] = useState<NormalizedWorkerProfile | null>(null);
  const [rawProfile, setRawProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setWorker(null);
      setRawProfile(null);
      setLoading(false);
      return;
    }

    let alive = true;

    setLoading(true);
    setError(null);

    getPublicProfile(id)
      .then((response) => {
        if (!alive) return;

        const normalized = normalizeWorkerProfile(response);

        setRawProfile(response);
        setWorker(normalized);

        if (!normalized) {
          setError("This user does not have a public worker profile.");
        }
      })
      .catch((err) => {
        if (!alive) return;

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Could not load worker profile";

        setWorker(null);
        setRawProfile(null);
        setError(Array.isArray(message) ? message.join(", ") : message);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  return {
    worker,
    rawProfile,
    loading,
    error,
  };
}
