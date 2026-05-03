"use client";

import { useTranslation } from "react-i18next";
import { useProfilePage } from "@/store/profileStore";
import { useEffect } from "react";

function ProfileNav() {
  const { t } = useTranslation();
  const { profilePage, changePage } = useProfilePage((state) => state);

  useEffect(() => {
    const savedPage = localStorage?.getItem("profile");
    if (savedPage) {
      changePage(savedPage);
    }
  }, [changePage]);

  return (
    <nav>
      <a
        onClick={() => changePage("info")}
        className={profilePage === "info" ? "active" : ""}
      >
        {t("profileInfo")}
      </a>
      <a
        onClick={() => changePage("statistics")}
        className={profilePage === "statistics" ? "active" : ""}
      >
        {t("statistics")}
      </a>
    </nav>
  );
}

export default ProfileNav;
