import { AVATAR_COLORS, getInitials } from "../_lib/utils";

/**
 * Renders a circular avatar: image if available, else initials with a
 * deterministic colour derived from the user's email char code.
 */
export function ProfileAvatar({ profile }) {
  const initials = getInitials(profile.first_name, profile.last_name);
  const colorClass = AVATAR_COLORS[(profile.email?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

  if (profile.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt={`${profile.first_name ?? ""} ${profile.last_name ?? ""}`}
        className="ring-border size-20 shrink-0 rounded-full object-cover ring-4 sm:size-24"
      />
    );
  }

  return (
    <div
      className={`ring-border flex size-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold ring-4 sm:size-24 sm:text-3xl ${colorClass}`}
    >
      {initials}
    </div>
  );
}
