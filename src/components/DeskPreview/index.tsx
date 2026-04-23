"use client";

import Markdown from "react-markdown";

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
    <div>
      <div
        onClick={() => {
          onActiveDeskChange(link);
        }}
      >
        <div>
          <Markdown>{name}</Markdown>
        </div>
        <div>
          <div>{formattedDate}</div>
        </div>
      </div>
      <div>
        <button onClick={() => handleDeleteDesk(id)}>🗑️</button>
        <button
          onClick={() => {
            console.log("edit desk");
          }}
        >
          ✍️
        </button>
      </div>
    </div>
  );
}

export default DeskPreview;
