"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ADMIN_EMAIL } from "@/lib/utils/constants";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const redirectPath = session.user.email === ADMIN_EMAIL ? "/admin" : "/staff";
        router.push(redirectPath);
      } else {
        router.push("/login");
      }
    }
    checkSession();
  }, [router]);

  return (
    <div className="flex min-h-full items-center justify-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  );
}
