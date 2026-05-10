"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfilePage } from "@/store/profileStore";
import { useEffect } from "react";
import { StorageUtil } from "@/utils/storageUtil";

function ProfileNav() {
  const { t } = useTranslation();
  const { profilePage, changePage } = useProfilePage((state) => state);

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
