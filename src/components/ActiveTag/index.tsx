"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { noteInputChange } from "@slices/noteSlice";
import { useContext, useEffect, useMemo, useRef } from "react";
import { SocketContext } from "@/providers/SocketProvider";
import { socketActions } from "@/utils/config";
import { ITag } from "@/interfaces";
import "./style.css";
import React from "react";

function ActiveTag({
  tag,
  scale,
  stageRef,
}: {
  tag: ITag;
  scale: number;
  stageRef: any;
}) {
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

  function canvasToScreen(canvasX: number, canvasY: number) {
    const stage = stageRef.current;
    const transform = stage.getAbsoluteTransform();
    return transform.point({ x: canvasX, y: canvasY });
  }

  const { x, y } = useMemo(() => {
    if (!stageRef.current) return { x: tag.x, y: tag.y };

    const transform = stageRef.current.getAbsoluteTransform().copy();
    return transform.point({ x: tag.x, y: tag.y });
  }, [tag.x, tag.y, scale]);

  if (!tag || !tag.id) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
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

export default React.memo(ActiveTag);
