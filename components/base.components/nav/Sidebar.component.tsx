import React, { Fragment, ReactNode, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faPowerOff,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import Link from "next/link";

import Cookies from "js-cookie";
import { cn, pcn, token_cookie_name } from "@utils/.";
import { ButtonComponent } from "../button/Button.component";

type CT = "backdrop" | "base" | "head-item" | "item" | "child-item";

export interface SidebarItemProps {
  label: string;
  key?: number;
  leftContent?: any;
  rightContent?: any;
  path?: string;
  items?: SidebarItemProps[];
  className?: string;
};

export interface SidebarHeadItemProps {
  label: string;
  collapse?: boolean;
  items?: SidebarItemProps[];
  className?: string;
};

export interface sidebarProps {
  head?: any;
  items?: SidebarHeadItemProps[];
  basePath?: string;
  show?: boolean;
  toggle?: boolean;
  onToggleChange?: () => void;
  children?: any;
  hasAccess?: number[];
  onChange?: () => void;

  /** Use custom class with: "backdrop::", "head-item::", "item::", "child-item::". */
  className?: string;
};

// interface sidebarWrapperProps {
//   path      ?:  string;
//   onClick   ?:  () => void;
//   children  ?:  any;
// }




function ListWrapper({
  path,
  children,
  onClick,
  onToggleChange,
}: {
  path?: string;
  onClick?: () => void;
  onToggleChange?: () => void;
  children?: any;
}) {
  const handleClick = () => {
    if (window.innerWidth < 768) {
      onToggleChange?.();
    }
    onClick?.();
  };

  if (path) {
    return (
      <Link href={path} onClick={handleClick}>
        {children}
      </Link>
    );
  } else {
    return <div onClick={handleClick}>{children}</div>;
  }
}



export function SidebarComponent({
  head,
  items,
  basePath,
  toggle,
  onToggleChange,
  // onChange,
  // hasAccess,
  className = "",
}: sidebarProps) {
  const router = useRouter();
  const [shows, setShows] = useState<string[]>([]);
  
  // Dummy user data for now
  const user = { name: "Admin" };

  const setShow = (key: string) => {
    setShows((prevShows) =>
      prevShows?.find((pk) => pk === key)
        ? prevShows.filter((pk) => pk !== key)
        : [...prevShows, key]
    );
  };

  const checkShow = (key: string): boolean => {
    if (shows?.includes(key)) {
      return true;
    }

    return false;
  };

  const cekActive = (path: string) => {
    const activePath =
      router.asPath?.split("?")[0]?.replace(`${basePath || ""}`, "") || "/";

    const currentPath = `${path ? `${path}` : ""}`;

    const isPrefix = (longer: string, shorter: string): boolean => {
      return (
        longer.startsWith(shorter) &&
        (longer === shorter || longer[shorter.length] === "/")
      );
    };

    return (
      isPrefix(activePath, currentPath) || isPrefix(currentPath, activePath)
    );
  };

  useEffect(() => {
    items?.map((head, head_key) => {
      head?.items?.map((menu, key) => {
        if (menu?.path && cekActive(menu?.path || "")) {
          setShow(`${head_key}`);
        }
        menu?.items?.map((child) => {
          if (child?.path && cekActive(child?.path || "")) {
            setShow(`${head_key}`);
            setShow(`${head_key}.${key}`);
          }
        });
      });
    });
  }, []);

  const styles = {
    backdrop: cn(
      "absolute top-0 left-0 w-full h-full bg-background bg-opacity-80 blur-md z-20 md:hidden",
      toggle ? "scale-100 bg-background opacity-80 z-25" : "scale-0",
      pcn<CT>(className, "backdrop")
    ),
    base: cn(
      "flex flex-col fixed h-screen px-2 py-4 overflow-y-auto bg-white z-30 rounded-r-[8px] border-r scroll transition-all",
      toggle ? "w-64" : "hidden w-20",
      pcn<CT>(className, "base")
    ),
    headItem:
      "flex justify-between items-center text-light-foreground font-semibold py-2 text-xs uppercase",
    item: "flex items-center justify-between px-2 py-2 gap-2 transition-colors duration-300 transform hover:text-primary cursor-pointer transition-none",
    childItem:
      "flex items-center justify-between px-2 py-2 gap-2 transition-colors duration-300 transform hover:text-primary cursor-pointer transition-none border-l-2",
  };

  return (
    <div>
      <div className={styles.backdrop} onClick={() => onToggleChange?.()}></div>
      <aside className={styles.base}>
        {head}
        <nav
          className="flex flex-col flex-1 mt-3 pb-4 overflow-y-scroll scroll"
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          {items?.map((menu_head, menu_head_key) => {
            return (
              <Fragment key={menu_head_key}>
                <div className="px-2 pt-2">
                  <div
                    className={cn(
                      styles.headItem,
                      menu_head?.collapse && "cursor-pointer",
                      pcn<CT>(className, "head-item"),
                      menu_head?.className
                    )}
                    onClick={() => setShow(String(menu_head_key))}
                  >
                    <span className={cn(!toggle && "hidden")}>
                      {menu_head?.label}
                    </span>
                    {menu_head.collapse && (
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className={cn(
                          "text-xs",
                          checkShow(String(menu_head_key)) && "rotate-180"
                        )}
                      />
                    )}
                  </div>

                  {(!menu_head?.collapse || checkShow(String(menu_head_key))) &&
                    menu_head?.items?.map((menu, menu_key) => {
                      return (
                        <Fragment key={`${menu_head_key}.${menu_key}`}>
                          <ListWrapper
                            onToggleChange={onToggleChange}
                            path={
                              menu?.path ? `${basePath || ""}${menu?.path}` : ""
                            }
                            onClick={() =>
                              setShow(`${menu_head_key}.${menu_key}`)
                            }
                          >
                            <div
                              className={cn(
                                styles.item,
                                menu?.path &&
                                cekActive(menu?.path || "") &&
                                "text-primary border-l-2 border-primary pl-4",
                                pcn<CT>(className, "item"),
                                menu?.className
                              )}
                            >
                              <div className="flex gap-2 items-center">
                                {menu?.leftContent}
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    !toggle && "hidden"
                                  )}
                                >
                                  {menu?.label}
                                </span>
                              </div>
                              <div className="flex gap-2 items-center">
                                {menu?.rightContent}

                                {menu?.items?.length && (
                                  <FontAwesomeIcon
                                    icon={faChevronUp}
                                    className={`text-sm ${checkShow(
                                      `${menu_head_key}.${menu_key}`
                                    ) || "rotate-180"
                                      }`}
                                  />
                                )}
                              </div>
                            </div>
                          </ListWrapper>
                          <div className="px-4">
                            <div className="flex flex-col">
                              {menu?.items?.length &&
                                checkShow(`${menu_head_key}.${menu_key}`) &&
                                menu?.items?.map((child, menu_child_key) => {
                                  return (
                                    <Fragment
                                      key={`${menu_head_key}.${menu_key}.${menu_child_key}`}
                                    >
                                      <ListWrapper
                                        onToggleChange={onToggleChange}
                                        path={
                                          child?.path
                                            ? `${basePath || ""}${child?.path}`
                                            : ""
                                        }
                                        onClick={() =>
                                          setShow(
                                            `${menu_head_key}.${menu_key}.${menu_child_key}`
                                          )
                                        }
                                      >
                                        <div
                                          className={cn(
                                            styles.childItem,
                                            child?.path &&
                                            cekActive(child?.path || "") &&
                                            "text-primary border-primary pl-4",
                                            pcn<CT>(className, "child-item"),
                                            child?.className
                                          )}
                                        >
                                          <div className="flex gap-2 items-center">
                                            {child?.leftContent}
                                            <span
                                              className={cn(
                                                "text-sm font-medium",
                                                !toggle && "hidden"
                                              )}
                                            >
                                              {child?.label}
                                            </span>
                                          </div>
                                          <div className="flex gap-2 items-center">
                                            {child?.rightContent}

                                            {child?.items?.length && (
                                              <FontAwesomeIcon
                                                icon={faChevronUp}
                                                className={`block text-sm ${checkShow(
                                                  `${menu_head_key}.${menu_key}`
                                                ) || "rotate-180"
                                                  }`}
                                              />
                                            )}
                                          </div>
                                        </div>
                                      </ListWrapper>
                                    </Fragment>
                                  );
                                })}
                            </div>
                          </div>
                        </Fragment>
                      );
                    })}
                </div>
              </Fragment>
            );
          })}
        </nav>
        <div className="min-h-[100px] p-4 space-y-2 ">
          <div className="flex gap-4 items-center shadow p-4">
            <div className="bg-slate-100 border h-10 aspect-square rounded-full flex justify-center items-center">
              <p className=" font-semibold">
                {user?.name?.substring(0, 2).toUpperCase() || "AN"}
              </p>
            </div>
            <p className={cn(!toggle && "hidden")}>
              {user?.name || "Admin"}
            </p>
          </div>
          <ButtonComponent
            className="text-red-500 font-semibold"
            icon={faPowerOff}
            label={toggle ? "Keluar" : ""}
            size="sm"
            variant="light"
            paint="danger"
            block
            onClick={() => {
              router.push("/");
              Cookies.remove(token_cookie_name);
              Cookies.remove("yukder-merchant.access_active");
            }}
          />
        </div>
      </aside>
      <div
        className={cn(
          "fixed z-35 bottom-4 h-12 flex items-center justify-center bg-primary text-white rounded-full transition-all",
          toggle ? "w-12 left-60" : "w-12 left-4"
        )}
        onClick={() => onToggleChange?.()}
      >
        <FontAwesomeIcon icon={toggle ? faChevronLeft : faChevronRight} />
      </div>
    </div>
  );
}

export function SidebarContentComponent({
  children,
  toggle,
}: {
  children: ReactNode;
  toggle?: boolean;
}) {
  return (
    <main
      className={cn(
        "w-full min-h-screen overflow-x-hidden transition-all",
        toggle ? "md:ml-64" : "md:ml-20"
      )}
    >
      {children}
    </main>
  );
}
