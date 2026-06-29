"use client";

import "@components/Input/style.css";
import { type ChangeEvent, type ComponentType } from "react";
import { type RegisterOptions, type UseFormRegister } from "react-hook-form";
import type { IForm } from "@/interfaces";

export interface FormInputProps {
  id: keyof IForm;
  description: string;
  placeholder: string;
  type: string;
  postId?: string;
  Icon: ComponentType;
  register: UseFormRegister<IForm>;
}

export interface InputProps {
  id: string;
  description: string;
  name: string;
  placeholder: string;
  type: string;
  Icon: ComponentType;
  value: string;
  postId?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function Input(props: InputProps | FormInputProps) {
  if ("register" in props) {
    const { id, description, placeholder, type, Icon, postId, register } =
      props;
    const registerOptions: RegisterOptions<IForm, "email" | "password"> = {
      required: true,
    };

    return (
      <div className="input-wrapper">
        <label
          id={id}
          htmlFor={postId ? "input" + id + postId : "input" + id}
          className="default-label"
        >
          <Icon />
          {description}
        </label>

        <input
          data-testid="input"
          className="default-input"
          id={postId ? "input" + id + postId : "input" + id}
          placeholder={placeholder}
          type={type}
          aria-describedby="username-success username-error username-warning"
          aria-required="true"
          {...register(id, registerOptions)}
        />
      </div>
    );
  } else {
    const {
      id,
      description,
      name,
      placeholder,
      type,
      Icon,
      value,
      onChange,
      postId,
    } = props;
    return (
      <div className="input-wrapper">
        <label
          htmlFor={"input" + postId ? id + postId : id}
          className="default-label"
        >
          <Icon />
          {description}
        </label>

        <input
          data-testid="input"
          className="default-input"
          id={"input" + postId ? id + postId : id}
          name={name}
          placeholder={placeholder}
          type={type}
          onChange={onChange}
          value={value}
        />
      </div>
    );
  }
}
