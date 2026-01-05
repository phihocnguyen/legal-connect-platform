"use client";
import { usePathname } from "next/navigation";
import { Header } from "../navbar/header";

const ConditionalHeader = () => {
  const pathname = usePathname();
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname === "/login" ||
    pathname === "/register"
  )
    return null;
  return <Header />;
};

export default ConditionalHeader;
