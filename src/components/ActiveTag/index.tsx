"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { noteInputChange } from "@slices/noteSlice";
import { useContext, useEffect, useRef } from "react";
import { SocketContext } from "@/providers/SocketProvider";
import { socketActions } from "@/utils/config";
import { ITag } from "@/interfaces";
import "./style.css";

function ActiveTag({ tag, scale }: { tag: ITag; scale: number }) {
  const dispatch = useDispatch();
  const { sendSocketMessage } = useContext(SocketContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    dispatch(noteInputChange({ name, value }));
    sendSocketMessage(socketActions.CHANGE, {
      id: tag.id,
      name,
      value,
      deskId: tag.deskId,
    });
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  if (!tag || !tag.id) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: tag.x,
        top: tag.y,
        width: "220px",
        height: "160px",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
      id={tag.id?.toString()}
      className={`tag-editable`}
    >
      <textarea
        ref={textareaRef}
        value={tag.title}
        name="title"
        onChange={handleChangeInput}
        placeholder="Заголовок"
      />
      <textarea
        name="body"
        value={tag.body}
        onChange={handleChangeInput}
        placeholder="Текст заметки..."
      />
    </div>
  );
}

export default ActiveTag;
