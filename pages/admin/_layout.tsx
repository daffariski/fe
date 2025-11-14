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
            basePath="/admin"
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
                    label: "Dashboard",
                    path: "/dashboard",
                  },
                  {
                    label: "Servis",
                    path: "/service",
                  },
                ],
              },
              {
                label: "Master",
                items: [
                  {
                    label: "Motor",
                    path: "/vehicle",
                  },
                  {
                    label: "Sukucadang",
                    path: "/product",
                  },
                  {
                    label: "Pegawai",
                    path: "/employee",
                  },
                  {
                    label: "Pelanggan",
                    path: "/customer",
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
