import {
  Outlet,
} from "react-router-dom";

import PublicFooter from "@/components/public/PublicFooter";
import PublicHeader from "@/components/public/PublicHeader";


export default function PublicLayout() {
  return (
    <div
      className="
        flex
        min-h-screen
        flex-col
        bg-slate-50
        text-slate-900
      "
    >
      <PublicHeader />

      <main
        className="
          flex-1
          pt-24
        "
      >
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}