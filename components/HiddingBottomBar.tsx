"use client";

import { usePathname } from "next/navigation";
import BottomBar from "./BottomBar";

export default function HiddingBottomBar() {
  const pathname = usePathname();

  const hideRoutes = ["/caodangnghe"];

  if (hideRoutes.includes(pathname)) return null;

  return <BottomBar />;
}