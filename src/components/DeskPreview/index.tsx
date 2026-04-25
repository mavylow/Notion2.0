"use client";

import TrashIcon from "@/assets/TrashIcon";
import Markdown from "react-markdown";
import Button from "../Button";

function DeskPreview({
  id,
  name,
  link,
  creationDate,
  onDelete,
  onActiveDeskChange,
}) {
  const formattedDate = new Date(creationDate).toLocaleString();

  const handleDeleteDesk = async (deskId: number) => {
    let isDelete = confirm("Вы действительно хотите удалить заметку?");
    if (!isDelete) {
      return;
    }
    onDelete(deskId);
  };

  return (
    <div className="side-preview-container">
      <section
        className="side-preview"
        onClick={() => {
          onActiveDeskChange(link);
        }}
      >
        <h1>
          <Markdown>{name}</Markdown>
        </h1>

        <time className="time" dateTime={`${creationDate}`}>
          {formattedDate}
        </time>
      </section>
      <div className="preview-buttons">
        <Button
          type="button"
          Icon={TrashIcon}
          onButtonClick={() => {
            handleDeleteDesk(id);
          }}
        />
      </div>
    </div>
  );
}

export default DeskPreview;
