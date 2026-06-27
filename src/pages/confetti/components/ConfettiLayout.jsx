import React from "react";
import { Outlet } from "react-router-dom";
import ConfettiNav from "./ConfettiNav";
import ConfettiFooter from "./ConfettiFooter";

export default function ConfettiLayout() {
  return (
    <div className="min-h-screen bg-[#FFF8F4] font-['Plus_Jakarta_Sans']">
      <ConfettiNav />
      <main className="pt-24">
        <Outlet />
      </main>
      <ConfettiFooter />
    </div>
  );
}