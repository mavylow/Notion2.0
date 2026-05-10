"use client";

import "@app/profile/style.css";
import ProfileInfo from "@components/ProfileInfo";
import Statistics from "@components/Statistics";
import { useProfilePage } from "@/store/profileStore";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { StorageUtil } from "@/utils/storageUtil";

function Profile() {
  const { profilePage, changePage } = useProfilePage((state) => state);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    const page = StorageUtil.get("profile");
    changePage(page || "info");
  }, [isMounted]);

  if (!isMounted) {
    return <CircularProgress aria-label="Loading…" />;
  }

  return (
    <>
      {profilePage === "info" && <ProfileInfo />}
      {profilePage === "statistics" && <Statistics />}
    </>
  );
}

export default Profile;
