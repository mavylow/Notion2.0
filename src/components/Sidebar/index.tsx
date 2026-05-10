"use client";

import "@components/Sidebar/style.css";
import FrameWrapper from "@components/FrameWrapper";
import { SidebarElement } from "@components/SidebarElement";
import { getGroups, getSuggested } from "@utils/apiUtil";
import type { IGroup, ISidebarUser } from "@/interfaces";
import { useQuery } from "@tanstack/react-query";
import { Box, Skeleton } from "@mui/material";
import { useEffect } from "react";

export default function Sidebar() {
  const { isLoading: isGroupsLoading, data: groups } = useQuery<
    IGroup[] | null
  >({ queryKey: ["groups"], queryFn: () => getGroups() });
  const { isLoading: isSuggestedUserLoading, data: suggestedUser } = useQuery<
    ISidebarUser[] | null
  >({
    queryKey: ["suggestedUsers"],
    queryFn: () => getSuggested(),
  });

  return (
    <aside className="main-aside">
      <FrameWrapper>
        <section className="suggested-people">
          <h3>Suggested people</h3>
          {isSuggestedUserLoading
            ? [1, 2, 3].map((index) => <SidebarSkeleton key={index} />)
            : suggestedUser
                ?.slice(0, 5)
                .map((user) => <SidebarElement key={user.id} element={user} />)}
        </section>
      </FrameWrapper>
      <FrameWrapper>
        <section className="suggested-communities">
          <h3>Communities you might like</h3>
          {isGroupsLoading
            ? [1, 2, 3, 4].map((index) => <SidebarSkeleton key={index} />)
            : groups
                ?.slice(0, 4)
                .map((community) => (
                  <SidebarElement key={community.id} element={community} />
                ))}
        </section>
      </FrameWrapper>
    </aside>
  );
}

const SidebarSkeleton = () => {
  return (
    <Box
      sx={{
        display: "grid",
        width: "293px",
        gridTemplateColumns: "48px 1fr",
        gridTemplateRows: "24px 1fr",
        padding: "12px 0",
      }}
    >
      <Skeleton
        variant="circular"
        width={48}
        height={48}
        sx={{ gridRow: "1 / span 2", bgcolor: "var(--border-color)" }}
      />
      <Skeleton
        variant="text"
        width={"60%"}
        sx={{ marginLeft: "16px", bgcolor: "var(--border-color)" }}
      />
      <Skeleton
        variant="text"
        width={"30%"}
        sx={{ marginLeft: "16px", bgcolor: "var(--border-color)" }}
      />
    </Box>
  );
};
