import { useState } from "react";
import { adminService } from "@/services/admin.service";
import { StaffCreatePayload, AdminProviderCreatePayload } from "../types";

export function useAdminActions(onActionComplete: () => Promise<void>) {
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function setUserStatus(userId: string, isActive: boolean) {
    const key = `user:${userId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await adminService.setUserStatus(userId, isActive);
      setMessage(isActive ? "User reactivated." : "User suspended.");
      await onActionComplete();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function setProviderStatus(userId: string, providerId: string, status: "approved" | "rejected") {
    const key = `provider:${providerId}:${status}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await adminService.reviewProvider(userId, providerId, status);
      setMessage(status === "approved" ? "Provider approved." : "Provider rejected.");
      await onActionComplete();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function createStaff(staffForm: StaffCreatePayload) {
    setActionLoading((prev) => ({ ...prev, "staff:create": true }));
    try {
      const res = await adminService.createStaff(staffForm);
      setMessage(res.message ?? "Staff account created.");
      await onActionComplete();
      return true;
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Could not create staff account.");
      return false;
    } finally {
      setActionLoading((prev) => ({ ...prev, "staff:create": false }));
    }
  }

  async function updateTicket(ticketId: string, status: string) {
    const key = `ticket:${ticketId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await adminService.updateSupportTicket(ticketId, status);
      setMessage("Support ticket updated.");
      await onActionComplete();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  function clearMessage() {
    setMessage("");
    setIsError(false);
  }

  return {
    actionLoading,
    message,
    isError,
    setUserStatus,
    setProviderStatus,
    createStaff,
    updateTicket,
    clearMessage,
    setMessage: (msg: string) => setMessage(msg),
    setIsError: (err: boolean) => setIsError(err),
  };
}