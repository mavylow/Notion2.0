"use client";

import { useState, type ChangeEvent } from "react";
import DOMPurify from "dompurify";
import CommentIcon from "@assets/CommentIcon";
import ChevronIcon from "@assets/ChevronIcon";
import Comment from "@components/Comment";
import EditPenIcon from "@assets/EditPenIcon";
import Input from "@components/Input";
import Button from "@components/Button";
import type { IUser, IComment, IPost } from "@/interfaces";
import { formattedDate } from "@utils/dateFormatter";
import React from "react";
import {
  addComment,
  deleteComment,
  dislikePost,
  likePost,
  loadPostComments,
  loadUser,
  loadLikes,
} from "@/utils/apiUtil";
import ChevronIconExpanded from "@/assets/ChevronIconExpanded";
import HeartLikeIcon from "@/assets/HeartLikeIcon";
import HeartDislikeIcon from "@/assets/HeartDislikeIcon";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Box, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  AddComment,
  Comments,
  Likes,
  PostArticle,
  PostAvatar,
  PostComments,
  PostFrame,
  PostHeader,
  PostInfo,
  WithoutComment,
} from "@components/Post/index.styled";
import Image from "next/image";

interface PostProps {
  post: IPost;
  onLike: () => void;
}

function Post({ post, onLike }: PostProps) {
  const { t } = useTranslation();

  const { id, authorId, title, content, image, creationDate } = post;
  const date = formattedDate(creationDate);
  const user = useSelector((state: RootState) => state.auth.user);
  const queryClient = useQueryClient();

  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [comment, setComment] = useState("");

  const { data: author } = useSuspenseQuery<IUser>({
    queryKey: ["users", authorId],
    queryFn: () => loadUser(authorId),
  });

  const { data: likedByUsers, refetch: refetchLikes } = useQuery({
    queryKey: ["users", id, "likes"],
    queryFn: () => loadLikes(id),
  });

  const { data: comments, refetch: refetchComments } = useQuery<IComment[]>({
    queryKey: ["posts", id, "comments"],
    queryFn: () => loadPostComments(id),
    enabled: !!user,
  });

  const dislikeAndLikeMutation = useMutation({
    mutationFn: async (action: "like" | "dislike") => {
      if (action === "like") {
        return likePost(id);
      }

      if (action === "dislike") {
        return dislikePost(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post"] });
      onLike();
      refetchLikes();
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", id, "comments"] });
      refetchComments();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (commentData: string) => addComment(commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", id, "comments"] });
      refetchComments();
    },
  });

  const handleExpand = () => {
    setIsCommentsExpanded((prev) => !prev);
  };

  const handleLikeAndDislike = async (action: "like" | "dislike") => {
    dislikeAndLikeMutation.mutate(action);
  };

  const handleAddComment = async () => {
    if (comment) {
      addCommentMutation.mutate(
        JSON.stringify({
          postId: post.id,
          text: DOMPurify.sanitize(comment),
        })
      );
    }
    refetchComments();
    setComment("");
  };

  const handleDeleteComment = async (commentId: number) => {
    deleteCommentMutation.mutate(commentId);
  };

  const handleSetComment = (e: ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  return (
    <PostArticle data-testid="post" className="post">
      <PostFrame className="post-frame">
        <WithoutComment>
          <PostHeader>
            <PostAvatar
              src={author.profileImage || "/assets/default.png"}
              alt={`Profile picture of ${author?.username}`}
              className="post-avatar"
              loading="lazy"
            />
            <h2>{author?.firstName}</h2>
            <time
              dateTime={creationDate}
              className="post-timestamp"
              title={creationDate}
            >
              {t(date.key, { count: date.count, date: date.date })}
            </time>
          </PostHeader>
          {image && (
            <figure>
              <Image
                src={image}
                alt="post-content image"
                width={700}
                height={700}
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
              />
            </figure>
          )}
          <div className="post-text">
            <h3>{title}</h3>
            <p> {content}</p>
          </div>
          <PostInfo>
            <Likes>
              {user && likedByUsers?.some((u) => u.userId === user.id) ? (
                <Button
                  type="button"
                  Icon={HeartLikeIcon}
                  onButtonClick={() => handleLikeAndDislike("dislike")}
                />
              ) : (
                <Button
                  type="button"
                  Icon={HeartDislikeIcon}
                  onButtonClick={() => handleLikeAndDislike("like")}
                />
              )}

              <span>{t("like", { count: likedByUsers?.length })}</span>
            </Likes>
            <Comments>
              <CommentIcon />
              {user ? (
                <>
                  {comments ? (
                    <span>{t("comment", { count: comments.length })}</span>
                  ) : (
                    <Skeleton variant="text" width={10} />
                  )}
                </>
              ) : (
                <span>{t("hiddenComments")} </span>
              )}
              {user && (
                <Button
                  Icon={isCommentsExpanded ? ChevronIconExpanded : ChevronIcon}
                  type="button"
                  onButtonClick={handleExpand}
                />
              )}
            </Comments>
          </PostInfo>
        </WithoutComment>

        {user && isCommentsExpanded && (
          <PostComments>
            {!comments ? (
              <CommentsSkeleton />
            ) : (
              comments.map((comment, i) => (
                <Comment
                  key={comment.id}
                  number={i + 1}
                  comment={comment}
                  onDelete={() => handleDeleteComment(comment.id)}
                />
              ))
            )}
          </PostComments>
        )}
        {user && (
          <AddComment>
            <Input
              id="comment"
              description={t("addAComment")}
              name="comment"
              placeholder={t("addCommentPlaceholder")}
              type="text"
              Icon={EditPenIcon}
              value={comment}
              onChange={handleSetComment}
              postId={id.toString()}
            />
            <Button
              description={t("addAComment")}
              type="button"
              onButtonClick={handleAddComment}
            />
          </AddComment>
        )}
      </PostFrame>
    </PostArticle>
  );
}

const CommentsSkeleton = () => (
  <Box sx={{ p: 2 }}>
    {[1, 2, 3].map((i) => (
      <Box key={i} sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          animation="wave"
          sx={{ bgcolor: "var(--border-color)" }}
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton
            variant="text"
            width="40%"
            height={20}
            animation="wave"
            sx={{ bgcolor: "var(--border-color)" }}
          />
          <Skeleton
            variant="text"
            width="80%"
            height={16}
            animation="wave"
            sx={{ bgcolor: "var(--border-color)" }}
          />
        </Box>
      </Box>
    ))}
  </Box>
);

export default React.memo(Post);
