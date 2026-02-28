import { useState } from "react";

type GroupInvite = {
  _id: string;
  conversationId: string;
  conversationName: string;
  conversationImage?: string;
  invitedBy: string;
  invitedByImage?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: number;
  otherInvitedUsers?: string[];
  message?: string;
};

type GroupInvitesPanelProps = {
  invites: GroupInvite[];
  onAccept: (inviteId: string) => void;
  onReject: (inviteId: string) => void;
  isLoading?: boolean;
};

export function GroupInvitesPanel({
  invites,
  onAccept,
  onReject,
  isLoading = false,
}: GroupInvitesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pendingInvites = invites.filter(i => i.status === "pending");

  if (pendingInvites.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-200">{pendingInvites.length}</span>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {pendingInvites.length} group {pendingInvites.length === 1 ? "invite" : "invites"}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 space-y-2 p-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4 text-xs text-zinc-400 dark:text-zinc-500">Loading invites...</div>
          ) : pendingInvites.length === 0 ? (
            <div className="text-center py-4 text-xs text-zinc-400 dark:text-zinc-500">No pending invites</div>
          ) : (
            pendingInvites.map((invite) => (
              <div
                key={invite._id}
                className="flex flex-col gap-3 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-900/10 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-200 font-bold shrink-0 shadow-sm border border-white dark:border-indigo-800">
                    {invite.conversationName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                      {invite.conversationName}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Invited by <span className="font-semibold text-zinc-700 dark:text-zinc-300">{invite.invitedBy}</span>
                    </p>
                    {invite.otherInvitedUsers && invite.otherInvitedUsers.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 grayscale opacity-70">
                        <div className="flex -space-x-2">
                          {invite.otherInvitedUsers.map((_, i) => (
                            <div key={i} className="h-4 w-4 rounded-full bg-zinc-200 dark:bg-zinc-700 border border-white dark:border-zinc-800" />
                          ))}
                        </div>
                        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
                          {invite.otherInvitedUsers.join(", ")} also invited
                        </p>
                      </div>
                    )}
                    {invite.message && (
                      <div className="mt-3 p-2.5 bg-white dark:bg-zinc-800 border border-indigo-50 dark:border-indigo-900 rounded-lg shadow-sm">
                        <p className="text-[10px] uppercase font-black text-indigo-500 dark:text-indigo-400 tracking-wider mb-1">Message:</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 italic leading-relaxed">"{invite.message}"</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAccept(invite._id)}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-600 dark:bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-all text-[11px] font-bold shadow-md shadow-indigo-100 dark:shadow-indigo-900/30 active:scale-[0.98]"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(invite._id)}
                    className="flex-1 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all text-[11px] font-bold active:scale-[0.98]"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
