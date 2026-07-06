"use client";
import Post from "@components/Post";
import type { IPost } from "@/interfaces";
import CreatePost from "@components/CreatePost";
import { useSelector } from "react-redux";
import type { RootState } from "@store/index";
import { useSuspenseQuery } from "@tanstack/react-query";
import { loadPosts } from "@utils/apiUtil";
import { Box, Skeleton, Stack } from "@mui/material";
import { Suspense, useCallback, useMemo } from "react";

function Home() {
  const { data: posts, refetch: refetchPosts } = useSuspenseQuery<IPost[]>({
    queryKey: ["post"],
    queryFn: loadPosts,
  });

  const user = useSelector((state: RootState) => state.auth.user);

  const handleRefetch = useCallback(() => {
    refetchPosts();
  }, [refetchPosts]);

  const sortedPosts = useMemo(() => {
    if (!posts) {
      return [];
    }
    return [...posts].sort(
      (a, b) =>
        new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
    );
  }, [posts]);

  return (
    <Suspense fallback={<Fallback />}>
      <main className={`home ${user && "auth"}`}>
        {user && <CreatePost onAdd={handleRefetch} />}
        {sortedPosts?.map((post) => (
          <Post
            data-testid="post"
            key={post.id}
            post={post}
            onLike={handleRefetch}
          />
        ))}
      </main>
    </Suspense>
  );
}

const Fallback = () => {
  return (
    <main className="home">
      <Box
        sx={{
          width: "min(700px, 100vw)",
          maxWidth: 800,
          mx: "auto",
          p: "1em",
          bgcolor: "var(--background-main)",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Skeleton
            variant="rectangular"
            height={100}
            sx={{ bgcolor: "var(--border-color)" }}
          />
        </Box>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </Box>
    </main>
  );
};

const PostSkeleton = () => (
  <Box
    sx={{ width: "100%", mb: 2, bgcolor: "var(--background-main)", p: "1em" }}
  >
    <Stack spacing={2}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Skeleton
          variant="circular"
          width={50}
          height={50}
          sx={{ bgcolor: "var(--border-color)" }}
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton
            variant="text"
            width="30%"
            height={24}
            sx={{ bgcolor: "var(--border-color)" }}
          />
          <Skeleton
            variant="text"
            width="20%"
            height={16}
            sx={{ bgcolor: "var(--border-color)" }}
          />
        </Box>
      </Box>

      <Skeleton
        variant="rectangular"
        width="100%"
        height={200}
        sx={{ bgcolor: "var(--border-color)" }}
      />

      <Box>
        <Skeleton
          variant="text"
          width="60%"
          height={28}
          sx={{ bgcolor: "var(--border-color)" }}
        />
        <Skeleton
          variant="text"
          width="100%"
          height={20}
          sx={{ bgcolor: "var(--border-color)" }}
        />
        <Skeleton
          variant="text"
          width="90%"
          height={20}
          sx={{ bgcolor: "var(--border-color)" }}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Skeleton
          variant="text"
          width={80}
          height={24}
          sx={{ bgcolor: "var(--border-color)" }}
        />
        <Skeleton
          variant="text"
          width={100}
          height={24}
          sx={{ bgcolor: "var(--border-color)" }}
        />
      </Box>
    </Stack>
  </Box>
);

export default Home;
