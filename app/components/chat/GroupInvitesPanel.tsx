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
    <div className="border-b border-zinc-200 bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-xs font-bold text-amber-700">{pendingInvites.length}</span>
          </div>
          <span className="text-sm font-medium text-zinc-700">
            {pendingInvites.length} group {pendingInvites.length === 1 ? "invite" : "invites"}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-100 space-y-2 p-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4 text-xs text-zinc-400">Loading invites...</div>
          ) : pendingInvites.length === 0 ? (
            <div className="text-center py-4 text-xs text-zinc-400">No pending invites</div>
          ) : (
            pendingInvites.map((invite) => (
              <div
                key={invite._id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-100 bg-white hover:bg-zinc-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">
                    {invite.conversationName}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    Invited by {invite.invitedBy}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onAccept(invite._id)}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    title="Accept invite"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onReject(invite._id)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                    title="Reject invite"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
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
