"use client";

import Markdown from "react-markdown";
import Button from "@components/Button";
import TrashIcon from "@/assets/TrashIcon";
import "@components/Preview/style.css";

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
  type,
}: PreviewProps) {
  const displayTitle = type === "note" ? title : name;

  const date = type === "note" ? createdAt : creationDate;
  const formattedDate = date ? new Date(date).toLocaleString() : "";

  const formattedTitle = () => {
    if (!displayTitle) return "Без названия";

    if (displayTitle.includes("\n")) {
      return displayTitle.split("\n")[0] + "...";
    }
    if (displayTitle.length > 20) {
      return displayTitle.slice(0, 20) + "...";
    }
    return displayTitle;
  };

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
    <div className="side-preview-container">
      <section className="side-preview" onClick={handleClick}>
        <h1>
          <Markdown>{formattedTitle()}</Markdown>
        </h1>
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
