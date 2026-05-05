"use client";

import { useContext } from "react";
import { ITag } from "@/interfaces";
import { socketActions } from "@/utils/config";
import { SocketContext } from "@/providers/SocketProvider";
import { Group, Rect, Text } from "react-konva";
import Markdown from "react-markdown";
import { Html } from "react-konva-utils";

function Tag({
  tag,
  onFocusChange,
  onDragEnd,
}: {
  tag: ITag;
  onFocusChange: (id: number) => void;
  onDragEnd: (id: number, x: number, y: number) => void;
}) {
  const { title, body, id, x, y, deskId, isActive } = tag;
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
          width={220}
          height={160}
          fill={isActive ? "#ffffff" : "#f9f9f9"}
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
          <div
            style={{
              backgroundColor: isActive ? "#ffffff" : "#f9f9f9",
              borderRadius: "12px",
              padding: "10px",
              maxHeight: "160px",
              overflowY: "auto",
              wordWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
          >
            <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
              <Markdown>{title}</Markdown>
            </div>
            <div
              style={{
                wordWrap: "break-word",
                wordBreak: "break-word",
                whiteSpace: "normal",
                overflow: "hidden",
              }}
            >
              <Markdown>{body}</Markdown>
            </div>
          </div>
        </Html>
      </Group>
    </>
  );
}

export default Tag;
