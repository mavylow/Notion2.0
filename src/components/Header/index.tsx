"use client";

import "@components/Header/style.css";
import SidekickLogoText from "@assets/SidekickLogoText";
import SidekickLogo from "@assets/SidekickLogo";
import { useEffect, useState } from "react";
import Hamburger from "@assets/HamburgerMenuIcon";
import Link from "next/link";
import { useSelector } from "react-redux";
import { type RootState } from "@/store";
import { useProfilePage } from "@store/profileStore";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "react-i18next";

function Header() {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPageAuth, setIsPageAuth] = useState(true);
  const location = usePathname();
  const navigate = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);
  const { changePage } = useProfilePage((state) => state);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setIsExpanded(false);
    if (
      location === "/signin" ||
      location === "/signup" ||
      !(location === "/" || location === "/profile")
    ) {
      setIsPageAuth(true);
    } else {
      setIsPageAuth(false);
    }
  }, [location]);

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add("nav-expanded");
    } else {
      document.body.classList.remove("nav-expanded");
    }

    return () => {
      document.body.classList.remove("nav-expanded");
    };
  }, [isExpanded]);

  const handleChangeMenuExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleNavigate = (url: string) => {
    navigate.replace(url);
  };

  return (
    <>
      <header
        className={
          (isMobile ? "mobile" : "desktop") +
          " " +
          (isExpanded ? "expanded" : "") +
          " " +
          (isPageAuth ? "auth-page" : "")
        }
        data-testid="header"
      >
        <div className="logo" onClick={() => handleNavigate("/")}>
          <SidekickLogo />
          <SidekickLogoText />
        </div>
        {!isPageAuth && (
          <>
            {user ? (
              <nav
                className={
                  isMobile && isExpanded ? "mobile-nav" : "desktop-nav"
                }
              >
                {isExpanded ? (
                  <>
                    <Link
                      data-testid="profile-info"
                      href={"/profile"}
                      onClick={() => {
                        handleChangeMenuExpanded();
                        changePage("info");
                      }}
                    >
                      Profile info
                    </Link>
                    <Link
                      data-testid="statistics"
                      href={"/profile"}
                      onClick={() => {
                        handleChangeMenuExpanded();
                        changePage("statistics");
                      }}
                    >
                      Statistics
                    </Link>
                    <Link data-testid="statistics" href={"/desk"}>
                      Desks
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href={"/profile"}>
                      <Image
                        src={user?.profileImage || "/assets/default.png"}
                        alt="profile-image"
                        height={24}
                        width={24}
                        style={{
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                        priority={true}
                      />
                    </Link>
                    <Link href={"/profile"}>{user.username}</Link>
                    <Link data-testid="statistics" href={"/desk"}>
                      {t("desks")}
                    </Link>
                  </>
                )}
              </nav>
            ) : (
              <nav
                className={
                  isMobile && isExpanded ? "mobile-nav" : "desktop-nav"
                }
              >
                <Link href={"/signin"}>Sing In</Link>
                <Link href={"/signup"}>Sing Up</Link>
              </nav>
            )}
          </>
        )}
        {!isPageAuth && (
          <button
            className="hamburger-menu"
            onClick={handleChangeMenuExpanded}
            aria-label="hamburger menu button"
          >
            {user && isExpanded ? (
              <Image
                src={user?.profileImage || "/assets/default.png"}
                alt="Hide menu profile image"
                height={24}
                width={24}
                style={{
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
                loading="lazy"
              />
            ) : (
              <Hamburger />
            )}
          </button>
        )}
      </header>
      {isMobile && isExpanded && (
        <div
          className="overlay"
          data-testid="overlay"
          onClick={handleChangeMenuExpanded}
        ></div>
      )}
    </>
  );
}

export default Header;
