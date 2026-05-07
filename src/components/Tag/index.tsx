"use client";

import { useContext, useEffect } from "react";
import { ITag } from "@/interfaces";
import { socketActions } from "@/utils/config";
import { SocketContext } from "@/providers/SocketProvider";
import { Group, Rect } from "react-konva";
import Markdown from "react-markdown";
import { Html } from "react-konva-utils";
import "@components/Tag/style.css";
import remarkGfm from "remark-gfm";

function Tag({
  tag,
  onFocusChange,
  onDragEnd,
  scale,
}: {
  tag: ITag;
  onFocusChange: (id: number) => void;
  onDragEnd: (id: number, x: number, y: number) => void;
  scale: number;
}) {
  const { title, body, id, x, y, deskId, height, width } = tag;
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
        draggable
        onDragEnd={handleDragEnd}
        onClick={() => {
          onFocusChange(id);
        }}
      >
        <Rect
          width={width / scale}
          height={height / scale}
          fill="transparent"
        />

        <Html
          divProps={{
            style: {
              position: "absolute",
              pointerEvents: "none",
              width: `${tag.width / scale}px`,
              height: `${tag.height / scale}px`,
            },
          }}
        >
          <div className="tag-container">
            <div className="tag-title">
              <Markdown remarkPlugins={[remarkGfm]}>{title}</Markdown>
            </div>

            <div className="tag-body">
              <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
            </div>
          </div>
        </Html>
      </Group>
    </>
  );
}

export default Tag;
