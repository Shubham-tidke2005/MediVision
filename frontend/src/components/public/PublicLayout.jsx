import {
  Outlet,
} from "react-router-dom";

import PublicFooter from "@/components/public/PublicFooter";
import PublicHeader from "@/components/public/PublicHeader";


export default function PublicLayout() {
  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        text-slate-900
      "
    >
      <PublicHeader />

      <main>
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}