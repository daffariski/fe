import {
  SidebarComponent,
  SidebarContentComponent,
} from "@/components/base.components";
import { ToggleContextProvider } from "@/contexts/Toggle.context";
import React, { ReactNode, useEffect, useState } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const [toggle, setToggle] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => {
      if (window.innerWidth < 768) {
        setToggle(false);
      }
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return (
    <>
      <ToggleContextProvider>
        <div className="flex">
          <SidebarComponent
            toggle={toggle}
            onToggleChange={() => setToggle(!toggle)}
            basePath="/mechanic"
            head={
              <div className="px-4">
                <a href="#" className="text-2xl font-extrabold italic">
                  YUDHA MOTOR
                </a>
                <p className="text-sm -mt-1 font-semibold text-slate-400">
                  Sistem Antrian Digital
                </p>
              </div>
            }
            items={[
              {
                label: "Beranda",
                items: [
                  {
                    label: "Tugas",
                    path: "/task",
                  },
                  {
                    label: "Servis",
                    path: "/service",
                  },
                ],
              },
             
            ]}
          />
          <SidebarContentComponent toggle={toggle}>
            <div className="p-2 lg:p-4">{children}</div>
          </SidebarContentComponent>
        </div>
      </ToggleContextProvider>
    </>
  );
}
