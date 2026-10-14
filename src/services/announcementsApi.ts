import axios from "axios";
import { API_BASE } from "@/lib/config";

export interface Announcement {
  id: number;
  title: string;
  category: string;
  summary: string;
  content: string;
  image_url?: string | null;
  published_at?: string | null;
  is_published: boolean;
  created_at?: string;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { Accept: "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function listPublicAnnouncements(): Promise<Announcement[]> {
  const response = await api.get<{ data: Announcement[] }>("/announcements");
  return response.data.data || [];
}

export async function listAdminAnnouncements(): Promise<Announcement[]> {
  const response = await api.get<{ data: Announcement[] }>("/admin/announcements");
  return response.data.data || [];
}

export type AnnouncementForm = Omit<Announcement, "id" | "created_at">;

export async function createAnnouncement(data: AnnouncementForm): Promise<Announcement> {
  const response = await api.post<{ data: Announcement }>("/admin/announcements", data);
  return response.data.data;
}
