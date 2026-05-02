"use client";
import { usePathname } from "next/navigation";
import HomePage from "@/components/HomePage";

export default function Page() {
  const pathname = usePathname();
  const lang = pathname.startsWith("/en") ? "en" : "es";
  return <HomePage lang={lang} />;
}
