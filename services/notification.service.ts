import { apiRequest } from "./api";
import { getToken } from "./auth.service";

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  notification_type: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string | null;
};

export const notificationService = {
  list(limit = 50) {
    return apiRequest<{ items: NotificationItem[]; unread_count: number }>(`/notifications?limit=${limit}`, {
      method: "GET",
      headers: authHeaders(),
    });
  },

  markRead(notificationId: string) {
    return apiRequest<NotificationItem>(`/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: authHeaders(),
    });
  },

  markAllRead() {
    return apiRequest("/notifications/read-all", {
      method: "POST",
      headers: authHeaders(),
    });
  },
};
