'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function RedirectToChat() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/chat");
  }, [router]);

  return (
    <p className="text-center text-sm text-zinc-500">
      Redirecting to chat...
    </p>
  );
}

export default RedirectToChat;