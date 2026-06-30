"use client";

import "@app/profile/style.css";
import ProfileInfo from "@components/ProfileInfo";
import Statistics from "@components/Statistics";
import { useProfilePage } from "@/store/profileStore";
import { useEffect } from "react";
import { StorageUtil } from "@/utils/storageUtil";

function Profile() {
  const { profilePage, changePage } = useProfilePage((state) => state);

  useEffect(() => {
    const page = StorageUtil.get("profile");
    changePage(page || "info");
  }, []);

  return (
    <>
      {profilePage === "info" && <ProfileInfo />}
      {profilePage === "statistics" && <Statistics />}
    </>
  );
}

export default Profile;
