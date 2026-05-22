import { useState, useEffect } from "react";
import { MobileTabSelector } from "./components/MobileTabSelector";
import { FeedbackBanner } from "./components/FeedbackBanner";
import { OverviewSection } from "./sections/OverviewSection";
import { UsersSection } from "./sections/UsersSection";
import { StaffSection } from "./sections/StaffSection";
import { ProvidersSection } from "./sections/ProvidersSection";
import { SupportSection } from "./sections/SupportSection";
import { PaymentsSection } from "./sections/PaymentsSection";
import { ReviewsSection } from "./sections/ReviewsSection";
import { UserDetail } from "./components/UserDetail";
import { AdminManagementPageProps, AdminTab } from "@/types";
import { EMPTY_STAFF_FORM, TABS } from "@/constants";
import { useAdminActions } from "@/hooks/useAdminActions";
import { useAdminData } from "@/hooks/useAdminData";
import { useProviderForms } from "@/hooks/useProviderForms";
import { ManagedUser } from "@/services/admin.service";
import { PageShell } from "../../components/PageShell";

export function AdminManagementPage({
  color,
  initialTab = "overview",
  canManageRoles,
}: AdminManagementPageProps) {
  const [tab, setTab] = useState<AdminTab>(initialTab);
  const [staffForm, setStaffForm] = useState(EMPTY_STAFF_FORM);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

  const { 
    overview, users, staff, payments, tickets, reviews, 
    providerTypes, loading, message, isError, customerUsers, 
    pendingProviders, loadManagementData, setMessage, setIsError 
  } = useAdminData(canManageRoles);

  const { 
    actionLoading, message: actionMessage, isError: actionIsError,
    setUserStatus, setProviderStatus, createStaff, updateTicket,
    clearMessage, setMessage: setActionMessage, setIsError: setActionIsError
  } = useAdminActions(loadManagementData);

  const {
    providerForms, ownerProviderForm, actionLoading: providerLoading,
    updateProviderForm, createProviderWorkspace, createProviderForOwner,
    updateOwnerProviderForm
  } = useProviderForms(providerTypes, loadManagementData);

  // Combine messages
  const displayMessage = actionMessage || message;
  const displayIsError = actionIsError || isError;

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createStaff(staffForm);
    if (success) {
      setStaffForm(EMPTY_STAFF_FORM);
    }
  };

  const handleOwnerProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProviderForOwner(ownerProviderForm);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Could not create provider workspace.");
      setActionIsError(true);
    }
  };

  const handleCreateProviderWorkspace = async (userId: string) => {
    const form = providerForms[userId] ?? {
      provider_type_name: providerTypes[0]?.name ?? "",
    };
    try {
      await createProviderWorkspace(userId, form);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Could not create provider workspace.");
      setActionIsError(true);
    }
  };

  const handleTabChange = (newTab: AdminTab) => {
    setTab(newTab);
    clearMessage();
  };

  return (
    <PageShell
      title="ConnectMW Management"
      subtitle="User support, provider verification, staff, payments, and platform trust"
      color={color}
    >
      <MobileTabSelector currentTab={tab} onTabChange={handleTabChange} />

      <div className="hidden sm:flex gap-1.5 overflow-x-auto scrollbar-none pb-1 mb-5">
        {TABS.map(([id, label]) => {
          if (id === "staff" && !canManageRoles) return null;
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all"
              style={
                tab === id
                  ? { background: color, color: "#0d1f2d" }
                  : { background: "rgba(255,255,255,0.05)", color: "#8ca5bc" }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      <FeedbackBanner message={displayMessage} isError={displayIsError} color={color} />

      {loading ? (
        <div
          className="rounded-xl p-5 text-sm"
          style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc" }}
        >
          Loading management data…
        </div>
      ) : (
        <>
          {tab === "overview" && (
            <OverviewSection overview={overview} tickets={tickets} payments={payments} reviews={reviews} color={color} />
          )}
          
          {tab === "users" && (
            <UsersSection
              customerUsers={customerUsers}
              providerTypes={providerTypes}
              providerForms={providerForms}
              actionLoading={{ ...actionLoading, ...providerLoading }}
              color={color}
              canManageRoles={canManageRoles}
              onUpdateProviderForm={updateProviderForm}
              onCreateProviderWorkspace={handleCreateProviderWorkspace}
              onSetUserStatus={setUserStatus}
              onSelectUser={setSelectedUser}
            />
          )}
          
          {tab === "staff" && canManageRoles && (
            <StaffSection
              staff={staff}
              staffForm={staffForm}
              actionLoading={actionLoading}
              color={color}
              onStaffFormChange={setStaffForm}
              onCreateStaff={handleStaffSubmit}
              onSetUserStatus={setUserStatus}
              onSelectUser={setSelectedUser}
            />
          )}
          
          {tab === "providers" && (
            <ProvidersSection
              pendingProviders={pendingProviders}
              providerTypes={providerTypes}
              providerForms={providerForms}
              ownerProviderForm={ownerProviderForm}
              actionLoading={{ ...actionLoading, ...providerLoading }}
              color={color}
              canManageRoles={canManageRoles}
              onUpdateProviderForm={updateProviderForm}
              onCreateProviderWorkspace={handleCreateProviderWorkspace}
              onOwnerProviderFormChange={updateOwnerProviderForm}
              onOwnerProviderSubmit={handleOwnerProviderSubmit}
              onSetProviderStatus={setProviderStatus}
            />
          )}
          
          {tab === "support" && (
            <SupportSection tickets={tickets} actionLoading={actionLoading} color={color} onUpdateTicket={updateTicket} />
          )}
          
          {tab === "payments" && <PaymentsSection payments={payments} color={color} />}
          
          {tab === "reviews" && <ReviewsSection reviews={reviews} color={color} />}
        </>
      )}

      {selectedUser && <UserDetail user={selectedUser} color={color} onClose={() => setSelectedUser(null)} />}
    </PageShell>
  );
}