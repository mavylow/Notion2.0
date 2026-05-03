"use client";

import { useContext } from "react";
import { ITag } from "@/interfaces";
import { socketActions } from "@/utils/config";
import { SocketContext } from "@/providers/SocketProvider";
import { Group, Rect, Text } from "react-konva";

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

        <Text
          text={title}
          fontSize={16}
          fontStyle="bold"
          padding={10}
          width={220}
          height={40}
          wrap="word"
          fill="#111"
        />

        <Text
          text={body}
          fontSize={14}
          padding={10}
          y={40}
          width={220}
          height={110}
          wrap="word"
          fill="#333"
        />
      </Group>
    </>
  );
}

export default Tag;
