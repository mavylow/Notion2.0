"use client";

import { useDispatch } from "react-redux";
import { noteInputChange } from "@slices/noteSlice";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { SocketContext } from "@/providers/SocketProvider";
import { socketActions } from "@/utils/config";
import { ITag } from "@/interfaces";
import "./style.css";
import React from "react";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import { Html } from "react-konva-utils";
import { Group, Rect } from "react-konva";

function ActiveTag({ tag }: { tag: ITag }) {
  const dispatch = useDispatch();
  const cursorPositionRef = useRef(0);
  const { sendSocketMessage } = useContext(SocketContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    const cursorPos = e.target.selectionStart;

    cursorPositionRef.current = cursorPos;

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

      textareaRef.current.setSelectionRange(
        cursorPositionRef.current,
        cursorPositionRef.current
      );
    }
  }, [tag.title, tag.body]);

  const safeHeight = Math.max(Number(tag.height) || 160, 100);
  const safeWidth = Math.max(Number(tag.width) || 220, 100);
  const safeX = Number(tag.x) || 0;
  const safeY = Number(tag.y) || 0;

  if (!tag || !tag.id) return null;

  return (
    <Group x={safeX} y={safeY}>
      <Rect
        height={safeHeight}
        width={safeWidth}
        fill="transparent"
        listening={false}
      />
      <Html>
        <div
          id={tag.id?.toString()}
          className="tag-editable"
          style={{ height: `${safeHeight}px`, width: `${safeWidth}px` }}
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
