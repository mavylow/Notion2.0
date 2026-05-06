"use client";

import { useContext, useEffect } from "react";
import { ITag } from "@/interfaces";
import { socketActions } from "@/utils/config";
import { SocketContext } from "@/providers/SocketProvider";
import { Group, Rect } from "react-konva";
import Markdown from "react-markdown";
import { Html } from "react-konva-utils";
import "@components/Tag/style.css";
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
        <Rect width={width} height={height} fill="transparent" />

        <Html
          divProps={{
            style: {
              position: "absolute",
              pointerEvents: "none",
              width: `${tag.width}px`,
              height: `${tag.height}px`,
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
