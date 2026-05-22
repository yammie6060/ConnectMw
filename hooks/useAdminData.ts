import { useState, useEffect, useMemo } from "react";
import { adminService } from "@/services/admin.service";
import { providerService } from "@/services/provider.service";
import { ManagedUser, ManagementOverview, ManagedPayment, ManagedReview, SupportTicket } from "@/services/admin.service";
import { ProviderTypeOption } from "@/services/provider.service";

export function useAdminData(canManageRoles: boolean) {
  const [overview, setOverview] = useState<ManagementOverview | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [staff, setStaff] = useState<ManagedUser[]>([]);
  const [payments, setPayments] = useState<ManagedPayment[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [reviews, setReviews] = useState<ManagedReview[]>([]);
  const [providerTypes, setProviderTypes] = useState<ProviderTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const customerUsers = useMemo(
    () => users.filter((u) => !u.roles.some((r) => ["admin", "support"].includes(r))),
    [users]
  );

  const pendingProviders = useMemo(
    () =>
      users
        .flatMap((u) => u.providers.map((p) => ({ user: u, provider: p })))
        .filter(({ provider }) => provider.verification_status === "pending"),
    [users]
  );

  async function loadManagementData() {
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const [overviewRes, usersRes, reviewsRes, paymentsRes, ticketsRes] = await Promise.all([
        adminService.getOverview(),
        adminService.listUsers(),
        adminService.listReviews(),
        adminService.listPayments(),
        adminService.listSupportTickets(),
      ]);
      setOverview(overviewRes.data ?? null);
      setUsers(usersRes.data?.items ?? []);
      setReviews(reviewsRes.data?.items ?? []);
      setPayments(paymentsRes.data?.items ?? []);
      setTickets(ticketsRes.data?.items ?? []);

      const providerTypesRes = await providerService.getProviderTypes();
      setProviderTypes(providerTypesRes.data ?? []);

      if (canManageRoles) {
        const staffRes = await adminService.listStaff();
        setStaff(staffRes.data?.items ?? []);
      }
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Could not load management data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadManagementData();
  }, [canManageRoles]);

  return {
    overview,
    users,
    staff,
    payments,
    tickets,
    reviews,
    providerTypes,
    loading,
    message,
    isError,
    customerUsers,
    pendingProviders,
    loadManagementData,
    setMessage,
    setIsError,
  };
}