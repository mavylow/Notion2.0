"use client";

import Markdown from "react-markdown";
import Button from "@components/Button";
import TrashIcon from "@/assets/TrashIcon";
import "@components/NotePreview/style.css";
import { ITag } from "@/interfaces";
import { Socket } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import ArrowIcon from "@/assets/ArrowIcon";
import { noteInputChange } from "@/slices/noteSlice";
import { socketActions } from "@/utils/config";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import { useContext } from "react";
import { SocketContext } from "@/providers/SocketProvider";

interface NotePreviewProps {
  tag: ITag;
  onBackButtonClick: () => void;
}

function NotePreview({ tag, onBackButtonClick }: NotePreviewProps) {
  const { sendSocketMessage } = useContext(SocketContext);
  const { title, createdAt } = tag;
  const dispatch = useDispatch();
  const { data: activeNote, loading: noteLoading } = useSelector(
    (state: RootState) => state.note
  );

  const formattedDate = new Date(createdAt).toLocaleString();
  if (noteLoading) {
    return <div>Loading...</div>;
  }
  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    dispatch(noteInputChange({ name, value }));
    sendSocketMessage(socketActions.CHANGE, {
      id: activeNote.id,
      name,
      value,
      deskId: activeNote.deskId,
    });
  };

  return (
    <div className="tag-editable full">
      <Button
        onButtonClick={onBackButtonClick}
        Icon={ArrowIcon}
        type="button"
      />
      <section className="note-fullscreen">
        <TextareaAutosize
          className="note-title-fullscreen"
          value={activeNote.title}
          name="title"
          id={activeNote?.id.toString()}
          onChange={handleChangeInput}
        ></TextareaAutosize>
        <TextareaAutosize
          className="note-body-fullscreen"
          name="body"
          id={activeNote?.id.toString()}
          value={activeNote.body}
          onChange={handleChangeInput}
        ></TextareaAutosize>

        {formattedDate && (
          <time className="time" dateTime={createdAt}>
            {formattedDate}
          </time>
        )}
      </section>
    </div>
  );
}

export default NotePreview;
