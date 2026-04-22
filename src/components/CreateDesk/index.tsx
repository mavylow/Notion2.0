"use client";

import "@components/CreatePost/style.css";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import Button from "@components/Button";
import Input from "@components/Input";
import EditPenIcon from "@assets/EditPenIcon";
import MailIcon from "@assets/MailIcon";
import ErrorIcon from "@assets/CrossIcon";
import Textarea from "@components/Textarea";
import * as Yup from "yup";

import InputMessage from "@components/InputMessage";
import ErrorWarningIcon from "@/assets/ErrorWarningIcon";
import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";
import AddIcon from "@/assets/AddIcon";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { MenuItem } from "@mui/material";
import { IDesk } from "@/interfaces";

const postFormInitial = {
  name: "",
  public: "false",
};

interface IDeskForm {
  name: string;
  public: string;
}

interface ICreatePostProps {
  onAdd: (data: IDesk) => void;
}

function CreateDesk({ onAdd }: ICreatePostProps) {
  const { t } = useTranslation();
  const FormSchema = Yup.object({
    name: Yup.string().required().max(20, t("max20chars")),
    public: Yup.string().required(),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const deskForm = useFormik<IDeskForm>({
    initialValues: postFormInitial,
    validationSchema: FormSchema,
    onSubmit: (data) => addDesk(data),
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

  const addDesk = async (data: IDeskForm) => {
    const newDesk = {
      name: DOMPurify.sanitize(data.name),
      public: data.public === "true",
    };

    onAdd(newDesk);
    deskForm.resetForm();
    handleDisplayAddMenu();
  };

  return (
    <>
      {isModalOpen && (
        <form
          data-testid="add-post-form"
          className="add-post"
          onSubmit={deskForm.handleSubmit}
        >
          <div className="post-form-header">
            <h2>{t("createDesk")}</h2>
            <Button
              type="button"
              Icon={ErrorIcon}
              onButtonClick={handleDisplayAddMenu}
            />
          </div>
          <div className="inputs">
            <Input
              id="desk-name"
              description={t("deskName")}
              name="name"
              placeholder={t("deskNamePlaceholder")}
              type="text"
              Icon={MailIcon}
              value={deskForm.values.name}
              onChange={deskForm.handleChange}
            />
            {deskForm.errors.name && (
              <InputMessage
                Icon={ErrorWarningIcon}
                status="error"
                message={deskForm.errors.name}
              />
            )}
            {/* <Textarea
              id="desk-link"
              description={t("deskLink")}
              name="link"
              placeholder={t("deskLinkPlaceholder")}
              Icon={EditPenIcon}
              value={deskForm.values.link || ""}
              onChange={deskForm.handleChange}
            />
            {deskForm.errors.link && (
              <InputMessage
                Icon={ErrorWarningIcon}
                status="error"
                message={deskForm.errors.link}
              />
            )} */}

            <Select
              name="public"
              sx={{
                color: "var(--text-color)",
                border: "var(--border-color)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--border-color)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--border-color)",
                },
              }}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={deskForm.values.public}
              label="Permission"
              onChange={deskForm.handleChange}
            >
              <MenuItem value={"true"}>Anyone with the link</MenuItem>
              <MenuItem value={"false"}>Permission denied</MenuItem>
            </Select>

            <Button type="submit" description={t("create")} />
          </div>
        </form>
      )}

      <Button
        type="button"
        Icon={AddIcon}
        onButtonClick={handleDisplayAddMenu}
        data-testid="button"
      />

      {isModalOpen && (
        <div className="overlay" onClick={handleDisplayAddMenu}></div>
      )}
    </>
  );
}

export default CreateDesk;
