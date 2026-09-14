import {
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import Header from "@/components/layout/Header";
import MobileSidebar from "@/components/layout/MobileSidebar";
import Sidebar from "@/components/layout/Sidebar";


export default function AppShell() {
  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        text-slate-900
      "
    >
      <Sidebar />

      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      <div
        className="
          min-w-0

          md:pl-20
          lg:pl-72
        "
      >
        <Header
          onOpenMenu={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main
          className="
            mx-auto
            w-full
            max-w-[1600px]
            p-4

            sm:p-6
            lg:p-8
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}