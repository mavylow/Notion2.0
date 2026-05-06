"use client";

import { useDispatch } from "react-redux";
import { noteInputChange } from "@slices/noteSlice";
import { useContext, useEffect, useMemo, useRef } from "react";
import { SocketContext } from "@/providers/SocketProvider";
import { socketActions } from "@/utils/config";
import { ITag } from "@/interfaces";
import "./style.css";
import React from "react";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import { Html } from "react-konva-utils";
import { Group } from "react-konva";

function ActiveTag({ tag }: { tag: ITag }) {
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
    <Group x={tag.x} y={tag.y} height={tag.height} width={tag.width}>
      <Html>
        <div
          id={tag.id?.toString()}
          className="tag-editable"
          style={{ height: `${tag.height}px`, width: `${tag.width}px` }}
        >
          <TextareaAutosize
            ref={textareaRef}
            value={tag.title}
            name="title"
            onChange={handleChangeInput}
            placeholder="Заголовок"
          />
          <TextareaAutosize
            name="body"
            value={tag.body}
            onChange={handleChangeInput}
            placeholder="Текст заметки..."
          />
        </div>
      </Html>
    </Group>
  );
}

export default React.memo(ActiveTag);
