import { useState } from "react";

type User = {
  _id: any;
  name?: string;
  imageUrl?: string;
  email?: string;
};

type GroupMembersModalProps = {
  isOpen: boolean;
  groupName: string;
  currentMembers: User[];
  allUsers: User[];
  onClose: () => void;
  onInvite: (userIds: string[]) => void;
  isLoading?: boolean;
};

export function GroupMembersModal({
  isOpen,
  groupName,
  currentMembers,
  allUsers,
  onClose,
  onInvite,
  isLoading = false,
}: GroupMembersModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentMemberIds = new Set(currentMembers.map(m => m._id));
  const availableUsers = allUsers.filter(u => !currentMemberIds.has(u._id));

  const handleInvite = async () => {
    if (selectedUsers.length === 0) return;
    await onInvite(selectedUsers);
    setSelectedUsers([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h2 className="font-bold text-zinc-900">Group Details: {groupName}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-[11px] font-bold text-zinc-400 tracking-wider block mb-1.5 uppercase">
              Current Members ({currentMembers.length})
            </label>
            <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
              {currentMembers.map(member => (
                <div
                  key={member._id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50 border border-zinc-200"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                    {member.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-700">{member.name || "User"}</p>
                    <p className="text-xs text-zinc-500">{member.email}</p>
                  </div>
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 tracking-wider block mb-1.5 uppercase">
              Invite More People
            </label>
            {availableUsers.length === 0 ? (
              <div className="text-center py-4 text-xs text-zinc-400 border border-zinc-200 rounded-xl">
                No more users to invite
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {availableUsers.map(user => (
                  <label
                    key={user._id}
                    className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${selectedUsers.includes(user._id)
                      ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                      : 'border-zinc-100 hover:border-zinc-200 bg-white'
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => {
                        if (selectedUsers.includes(user._id)) {
                          setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                        } else {
                          setSelectedUsers([...selectedUsers, user._id]);
                        }
                      }}
                    />
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                      {user.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-700">{user.name || "User"}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                    {selectedUsers.includes(user._id) && (
                      <div className="h-4 w-4 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-zinc-50 border-t border-zinc-100">
          <button
            onClick={handleInvite}
            disabled={selectedUsers.length === 0 || isLoading}
            className="w-full bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
          >
            {isLoading ? "Sending invites..." : `Send Invites (${selectedUsers.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
