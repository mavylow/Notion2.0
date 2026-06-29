"use client";

import "@components/CreatePost/style.css";
import { useEffect, useState, type ChangeEvent } from "react";
import FrameWrapper from "@components/FrameWrapper";
import { useFormik } from "formik";
import Button from "@components/Button";
import Input from "@components/Input";
import EditPenIcon from "@assets/EditPenIcon";
import MailIcon from "@assets/MailIcon";
import UploadFileIcon from "@assets/UploadFileIcon";
import ErrorIcon from "@assets/CrossIcon";
import Textarea from "@components/Textarea";
import * as Yup from "yup";
import { addPostsAxios } from "@utils/apiUtil";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import InputMessage from "@components/InputMessage";
import ErrorWarningIcon from "@/assets/ErrorWarningIcon";
import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";
import Image from "next/image";

const postFormInitial = {
  title: "",
  content: "",
};
const MAX_FILE_SIZE = 1_048_576;
const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
];

interface IPostForm {
  title: string;
  content?: string;
  image?: Blob;
}

interface ICreatePostProps {
  onAdd: () => void;
}

function CreatePost({ onAdd }: ICreatePostProps) {
  const { t } = useTranslation();
  const FormSchema = Yup.object({
    title: Yup.string().required(t("titleRequired")).max(20, t("max20chars")),

    content: Yup.string().max(200, t("max200chars")),

    image: Yup.mixed<File>()
      .nullable()
      .test(
        "fileSize",
        t("imageMaxSize"),
        (value) => !value || value.size <= MAX_FILE_SIZE
      )
      .test(
        "fileFormat",
        t("wrongFileFormat"),
        (value) => !value || SUPPORTED_FORMATS.includes(value.type)
      ),
  });
  const user = useSelector((state: RootState) => state.auth.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const postForm = useFormik<IPostForm>({
    initialValues: postFormInitial,
    validationSchema: FormSchema,
    onSubmit: (data) => addPost(data),
  });

  const handleDisplayAddMenu = () => {
    setIsModalOpen((prev) => !prev);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  const addPost = async (data: IPostForm) => {
    const newPost = {
      title: DOMPurify.sanitize(data.title),
      content: data.content && DOMPurify.sanitize(data.content),
      image: data.image ? URL.createObjectURL(data.image) : null,
    };

    await addPostsAxios(JSON.stringify(newPost));
    postForm.resetForm();
    handleDisplayAddMenu();
    onAdd();
  };

  const addFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) {
      return;
    }
    postForm.setFieldValue("image", file);
  };

  return (
    <>
      {isModalOpen && (
        <form
          data-testid="add-post-form"
          className="add-post"
          onSubmit={postForm.handleSubmit}
        >
          <div className="post-form-header">
            <h2>{t("createPost")}</h2>
            <Button
              type="button"
              Icon={ErrorIcon}
              onButtonClick={handleDisplayAddMenu}
            />
          </div>
          <div className="inputs">
            <Input
              id="post-title"
              description={t("postTitle")}
              name="title"
              placeholder={t("postTitlePlaceholder")}
              type="text"
              Icon={MailIcon}
              value={postForm.values.title}
              onChange={postForm.handleChange}
            />
            {postForm.errors.title && (
              <InputMessage
                Icon={ErrorWarningIcon}
                status="error"
                message={postForm.errors.title}
              />
            )}
            <Textarea
              id="post-description"
              description={t("description")}
              name="content"
              placeholder={t("descriptionPlaceholder")}
              Icon={EditPenIcon}
              value={postForm.values.content || ""}
              onChange={postForm.handleChange}
            />
            {postForm.errors.content && (
              <InputMessage
                Icon={ErrorWarningIcon}
                status="error"
                message={postForm.errors.content}
              />
            )}

            <label htmlFor="image" className="postImg-label">
              <UploadFileIcon />
              <div>
                <p>{t("selectFile")}</p>
                <span>
                  {isMobile
                    ? t("imagePlaceholderShort")
                    : t("imagePlaceholderLong")}
                </span>
              </div>
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              hidden
              onChange={addFile}
            />
            {postForm.errors.image ? (
              <InputMessage
                Icon={ErrorWarningIcon}
                status="error"
                message={postForm.errors.image as string}
              />
            ) : (
              <InputMessage
                Icon={ErrorWarningIcon}
                status="warning"
                message={t("imageMaxSize")}
              />
            )}
          </div>
          <Button type="submit" description={t("create")} />
        </form>
      )}
      <FrameWrapper>
        <div className="create-post">
          <div>
            <Image
              src={user?.profileImage || "/assets/default.png"}
              alt="profile-image"
              width={64}
              height={64}
            />
            <span>{t("whatHappening")}</span>
          </div>

          <Button
            type="button"
            description={t("tellEveryone")}
            onButtonClick={handleDisplayAddMenu}
            data-testid="button"
          />
        </div>
      </FrameWrapper>
      {isModalOpen && (
        <div className="overlay" onClick={handleDisplayAddMenu}></div>
      )}
    </>
  );
}

export default CreatePost;
