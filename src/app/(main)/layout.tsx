import { Suspense } from "react";
import SessionProvider from "@/components/layout/SessionProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import UploadPanel from "@/components/files/UploadPanel";
import MobileFab from "@/components/layout/MobileFab";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden">
        <Suspense>
          <Sidebar />
        </Suspense>
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Suspense>
            <TopBar />
          </Suspense>
          <main className="flex-1 overflow-y-auto p-3 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <UploadPanel />
      <Suspense>
        <MobileFab />
      </Suspense>
    </SessionProvider>
  );
}
