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
      {/* ==============================================
          DESKTOP SIDEBAR
      ============================================== */}

      <Sidebar />


      {/* ==============================================
          MOBILE SIDEBAR
      ============================================== */}

      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() =>
          setMobileSidebarOpen(false)
        }
      />


      {/* ==============================================
          MAIN APPLICATION AREA
      ============================================== */}

      <div
        className="
          min-h-screen
          min-w-0

          transition-[padding]
          duration-200

          md:pl-20
          lg:pl-72
        "
      >
        {/* HEADER */}

        <Header
          onOpenMenu={() =>
            setMobileSidebarOpen(true)
          }
        />


        {/* PAGE CONTENT */}

        <main
          className="
            mx-auto
            w-full
            max-w-[1600px]

            px-3
            pb-6
            pt-1

            sm:px-5
            sm:pb-8
            sm:pt-2

            lg:px-6
            lg:pb-10
          "
        >
          <div
            className="
              min-w-0
            "
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}