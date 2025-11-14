import React from "react";
import {
  faHome,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

import { useRouter } from "next/router";
import { useAuthContext } from "@/contexts/Auth.context";
import { auth } from "@/utils";

export const BottomNavComponent = () => {
  const { user, setAccessToken, setUser } = useAuthContext();
  const router = useRouter();

  const handleLogout = () => {
    auth.deleteAccessToken()
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  };

  const navItems = [
    { href: `/?id=${user?.id||''}`, icon: faHome, label: "Catalog" },
    {
      href: user?.id ? `/me/${user.id}` : "/login",
      icon: faUser,
      label: "Profile",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-30 w-full h-16 bg-white border-t border-gray-200">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        {navItems.map((item) => (
          <Link
            prefetch={true}
            href={item.href}
            key={item.href}
            className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50`}
          >
            <FontAwesomeIcon icon={item.icon} className="w-6 h-6 mb-1" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 text-red-600"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="w-6 h-6 mb-1" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};
