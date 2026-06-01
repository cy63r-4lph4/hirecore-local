// src/lib/api/axios.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { clearAuthStorage } from "@/lib/storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type FailedQueueItem = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

function processQueue(error: unknown = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
}

function forceLogout() {
  clearAuthStorage();

  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;

    /**
     * Prevent redirect loops while already on public auth pages.
     */
    if (!currentPath.startsWith("/auth")) {
      window.location.href = "/auth";
    }
  }
}

function shouldSkipRefresh(url?: string) {
  if (!url) return false;

  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/password/forgot") ||
    url.includes("/auth/password/reset")
  );
}

function isSilentAuthProbe(url?: string) {
  if (!url) return false;

  /**
   * AuthProvider uses /auth/me simply to ask:
   * "Is there a valid cookie session?"
   *
   * If there is not, that is normal on public pages.
   * Do not force a hard redirect.
   */
  return url.includes("/auth/me");
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<any>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    const status = error.response?.status;

    /**
     * 403 means "authenticated but not allowed".
     * Do not try to refresh.
     *
     * Examples:
     * - EMAIL_VERIFICATION_REQUIRED
     * - wrong account type
     * - role restriction
     */
    if (status === 403) {
      return Promise.reject(error);
    }

    /**
     * Only 401s are refresh candidates.
     */
    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    /**
     * If a refresh is already running,
     * wait for it and retry once the cookie is updated.
     */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => {
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      /**
       * refresh_token is sent automatically in the HttpOnly cookie.
       * The backend sets new auth cookies in the response.
       */
      await refreshClient.post("/auth/refresh", {});

      processQueue();

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);

      /**
       * /auth/me may fail simply because a visitor is not logged in.
       * On public pages, that is not a logout crisis.
       */
      if (isSilentAuthProbe(originalRequest.url)) {
        clearAuthStorage();
      } else {
        forceLogout();
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
