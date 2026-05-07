"use client";

import Markdown from "react-markdown";
import Button from "@components/Button";
import TrashIcon from "@/assets/TrashIcon";
import "@components/Preview/style.css";
import { useEffect, useMemo } from "react";

interface PreviewProps {
  id: number;
  title?: string;
  name?: string;
  desk?: boolean;
  createdAt?: string;
  creationDate?: string;
  link?: string;
  onDelete: (id: number) => void;
  onClick: (id: number | string, desk?: boolean) => void;
  onDoubleClick: () => {};
  type: "note" | "desk";
}

function Preview({
  id,
  title,
  name,
  desk,
  createdAt,
  creationDate,
  link,
  onDelete,
  onClick,
  onDoubleClick,
  type,
}: PreviewProps) {
  const date = type === "note" ? createdAt : creationDate;
  const formattedDate = date ? new Date(date).toLocaleString() : "";

  const formattedTitle = (h1) => {
    if (!h1) return "Без названия";

    if (h1.includes("\n")) {
      return h1.split("\n")[0] + "...";
    }
    if (h1.length > 15) {
      return h1.slice(0, 15) + "...";
    }
    return h1;
  };

  const displayTitle = useMemo(() => {
    return formattedTitle(type === "note" ? title : name);
  }, [title]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const isDelete = confirm("Вы действительно хотите удалить?");
    if (!isDelete) return;
    onDelete(id);
  };

  const handleClick = () => {
    if (type === "note") {
      onClick(id, desk);
    } else {
      onClick(link);
    }
  };

  return (
    <div
      className="side-preview-container"
      id={`${id}`}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
    >
      <section className="side-preview">
        <div className="side-preview-title">
          <Markdown>{formattedTitle(displayTitle)}</Markdown>
        </div>
        {formattedDate && (
          <time className="time" dateTime={date}>
            {formattedDate}
          </time>
        )}
      </section>
      <div className="preview-buttons">
        <Button type="button" Icon={TrashIcon} onButtonClick={handleDelete} />
      </div>
    </div>
  );
}

export default Preview;
