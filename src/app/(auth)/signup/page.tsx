"use client";

import "@auth/style.css";
import { useEffect, useState } from "react";
import MailIcon from "@/assets/MailIcon";
import EyeOpenIcon from "@/assets/EyeOpenIcon";
import EyeCrossedIcon from "@/assets/EyeCrossedIcon";
import Button from "@components/Button";
import Input from "@components/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorWarningIcon from "@/assets/ErrorWarningIcon";
import ThumbUpIcon from "@/assets/ThumbUpIcon";
import { useForm } from "react-hook-form";
import CrossIcon from "@/assets/CrossIcon";
import CheckIcon from "@/assets/CheckIcon";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { signUp } from "@/slices/authSlice";
import InputMessage from "@components/InputMessage";
import { useTranslation } from "react-i18next";
import { redirect } from "next/navigation";
import Link from "next/link";

function SignUp() {
  const { t } = useTranslation();

  const FormSchema = z.object({
    email: z.email(t("emailNotValid")),
    password: z
      .string()
      .min(8, t("shortPassword"))
      .max(14, t("longPassword"))
      .regex(/[0-9]/, t("passwordContainNumber")),
  });

  type FormData = z.infer<typeof FormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, submitCount },
  } = useForm<FormData>({
    defaultValues: {
      email: "helena.hills@social.com",
      password: "",
    },
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector<RootState>((state) => state.auth.user);
  const showEmailValidation = touchedFields.email || submitCount > 0;

  const showPasswordValidation = touchedFields.password || submitCount > 0;

  const onSubmit = handleSubmit((data) => {
    dispatch(signUp(data));
  });

  useEffect(() => {
    if (!user) return;

    const desk = sessionStorage.getItem("redirectAfterAuth");

    if (desk) {
      sessionStorage.removeItem("redirectAfterAuth");
      redirect(desk);
    } else {
      redirect("/");
    }
  }, [user]);

  return (
    <main>
      <form className="sing-up" onSubmit={onSubmit}>
        <div className="form-header">
          <h1>{t("createAccount")}</h1>
          <p>
            {t("enterFields", { sign: t("toSignUp"), appPreposition: "ом" })}
          </p>
        </div>
        <div className="inputs">
          <div className="input-container">
            <Input
              id="email"
              description={t("email")}
              placeholder={t("emailPlaceholder")}
              type="email"
              Icon={MailIcon}
              register={register}
            />

            {showEmailValidation &&
              (errors.email ? (
                <>
                  <div className="input-message">
                    <InputMessage
                      message={errors.email.message!}
                      Icon={ErrorWarningIcon}
                      status="error"
                    />
                  </div>
                  <div className="error email-warning">
                    <CrossIcon />
                  </div>
                </>
              ) : (
                <div className="correct email-warning">
                  <CheckIcon />
                </div>
              ))}
          </div>

          <div className="input-container">
            <div
              data-testid="password-icon"
              className="password-icon"
              onClick={() => setIsPasswordOpen((p) => !p)}
            >
              {isPasswordOpen ? <EyeCrossedIcon /> : <EyeOpenIcon />}
            </div>

            <Input
              id="password"
              description={t("password")}
              placeholder={t("passwordPlaceholder")}
              type={isPasswordOpen ? "text" : "password"}
              Icon={EyeOpenIcon}
              register={register}
            />

            {showPasswordValidation &&
              (errors.password ? (
                <InputMessage
                  message={errors.password.message!}
                  Icon={ErrorWarningIcon}
                  status="error"
                />
              ) : (
                <InputMessage
                  message="Your password is strong"
                  Icon={ThumbUpIcon}
                  status="success"
                />
              ))}
          </div>

          <Button description={t("signUp")} type="submit" />
        </div>
        <p className="legal-disclaimer">
          {t("termsAgreement")}{" "}
          <a href="/terms" className="legal-link" rel="nofollow">
            {t("termsOfService")}
          </a>{" "}
          {t("and")}{" "}
          <a href="/privacy" className="legal-link" rel="nofollow">
            {t("privacyPolicy")}
          </a>
        </p>
      </form>

      <span>
        {t("alreadyHaveAccount")}{" "}
        <Link href={"/signin"} className="nav-link">
          {t("signIn")}
        </Link>
      </span>
    </main>
  );
}

export default SignUp;
