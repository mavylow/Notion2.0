"use client";

import Markdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { noteInputChange } from "@slices/noteSlice";
import { useContext, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import "@components/Tag/style.css";
import { RootState } from "@/store";
import { ITag, IUser } from "@/interfaces";
import { Socket } from "socket.io-client";
import { socketActions } from "@/utils/config";
import { SocketContext } from "@/providers/SocketProvider";

function Tag({
  tag,
  onFocusChange,
}: {
  tag: ITag;
  onFocusChange: (id: number) => void;
}) {
  const { title, body, id, x, y, deskId, isActive } = tag;
  const { sendSocketMessage } = useContext(SocketContext);
  const { data: activeNote } = useSelector((state: RootState) => state.note);
  const dispatch = useDispatch();

  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "tag",
      canDrag: !isActive,
      item: { id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
        canDrag: monitor.canDrag(),
      }),
    }),
    [isActive]
  );

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    dispatch(noteInputChange({ name, value }));
    sendSocketMessage(socketActions.CHANGE, { id, name, value, deskId });
  };

  drag(ref);
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        opacity: isDragging ? 0.7 : 1,
        cursor: "move",
      }}
      id={id?.toString()}
      className={`tag ${isActive && "tag-editable"}`}
      onClick={() => onFocusChange(id)}
    >
      {!isActive && (
        <>
          <div>
            <Markdown>{title}</Markdown>
          </div>
          <div>
            <Markdown>{body}</Markdown>
          </div>
        </>
      )}

      {isActive && (
        <>
          <textarea
            value={activeNote.title}
            name="title"
            id={id?.toString()}
            onChange={handleChangeInput}
          ></textarea>
          <textarea
            name="body"
            id={id?.toString()}
            value={activeNote.body}
            onChange={handleChangeInput}
          ></textarea>
        </>
      )}
    </div>
  );
}

export default Tag;
