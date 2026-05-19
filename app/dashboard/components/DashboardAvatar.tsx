import { SessionUser } from "../types/dashboard";

interface DashboardAvatarProps {
  user: SessionUser;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS = {
  sm: "w-9 h-9 text-sm",
  md: "w-10 h-10 text-sm",
  lg: "w-20 h-20 text-2xl",
};

export function DashboardAvatar({ user, size = "sm", className = "" }: DashboardAvatarProps) {
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}` || "U";
  const sizeClass = SIZE_CLASS[size];

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-black flex-shrink-0 ${className}`}
      style={{ background: "linear-gradient(135deg, #1b4f6a, #f5ab20)", color: "#0d1f2d" }}
    >
      {initials}
    </div>
  );
}
