"use client";

import { usePathname, useRouter } from "next/navigation";
import Markdown from "react-markdown";
export default function NotePreview({
  id,
  title,
  body,
  desk,
  createdAt,
  onDelete,
  onNotePreviewClick,
}) {
  const navigate = useRouter();

  const formattedDate = new Date(createdAt).toLocaleString();
  const location = usePathname();

  const formattedBody = () => {
    if (body?.includes("\n")) {
      return body.split("\n")[0] + "...";
    }
    if (body?.length > 60) {
      return body.slice(0, 60) + "...";
    }
    return body;
  };
  const handleDeleteNote = async (noteId) => {
    let isDelete = confirm("Вы действительно хотите удалить заметку?");
    if (!isDelete) {
      return;
    }
    onDelete(noteId);
  };

  return (
    <div>
      <div
        onClick={() => {
          location === "/notes" && navigate.replace(`/notes/${id}`);
        }}
        onDoubleClick={() => {
          location === "/desk" && onNotePreviewClick(id, desk);
        }}
      >
        <div>
          <Markdown>{title}</Markdown>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="text-sm text-slate-700 ">{formattedDate}</div>
          <div className="text-sm text-slate-700 ">
            <Markdown>{formattedBody()}</Markdown>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-3">
        <button onClick={() => handleDeleteNote(id)}>🗑️</button>
        <button
          onClick={() => {
            navigate.replace(`/notes/edit/${id}`);
          }}
        >
          ✍️
        </button>
      </div>
    </div>
  );
}
