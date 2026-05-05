"use client";

import { useContext } from "react";
import { ITag } from "@/interfaces";
import { socketActions } from "@/utils/config";
import { SocketContext } from "@/providers/SocketProvider";
import { Group, Rect, Text } from "react-konva";
import Markdown from "react-markdown";
import { Html } from "react-konva-utils";
import "@components/Tag/style.css";

function Tag({
  tag,
  onFocusChange,
  onDragEnd,
}: {
  tag: ITag;
  onFocusChange: (id: number) => void;
  onDragEnd: (id: number, x: number, y: number) => void;
}) {
  const {
    title,
    body,
    id,
    x,
    y,
    deskId,
    isActive,
    height = 160,
    width = 220,
  } = tag;
  const { sendSocketMessage } = useContext(SocketContext);

  const handleDragEnd = (e) => {
    const newX = e.target.x();
    const newY = e.target.y();

    onDragEnd(id, newX, newY);

    sendSocketMessage(socketActions.MOVE, {
      id,
      x: newX,
      y: newY,
      deskId,
    });
  };

  return (
    <>
      <Group
        x={x}
        y={y}
        draggable={!isActive}
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          console.log(e.target);
          onFocusChange(id);
        }}
      >
        <Rect
          width={width || 220}
          height={height || 160}
          fill={"none"}
          cornerRadius={12}
          shadowBlur={isActive ? 10 : 4}
          stroke={isActive ? "#333" : undefined}
          strokeWidth={isActive ? 2 : 0}
        />

        <Html
          divProps={{
            style: {
              position: "absolute",
              width: "220px",
              pointerEvents: "none",
            },
          }}
        >
          <div className="tag-container">
            <div className="tag-title">
              <Markdown>{title}</Markdown>
            </div>
            <div className="tag-body">
              <Markdown>{body}</Markdown>
            </div>
          </div>
        </Html>
      </Group>
    </>
  );
}

export default Tag;
