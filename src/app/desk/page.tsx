"use client";

import NotePreview from "@/components/NotePreview";
import Tag from "@/components/Tag";
import { AuthContext } from "@/providers/AuthProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useRef, useState } from "react";
import { ItemTypes } from "@utils/config";
import "@app/desk/style.css";
import { useDrop } from "react-dnd";
import { Note } from "@/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchNote, resetNote } from "@/slices/noteSlice";
import { deleteNote } from "@/utils/apiUtil";

function Desk() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const { data: activeNote, loading: noteLoading } = useSelector(
    (state: RootState) => state.note
  );
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const tagRef = useRef(null);

  const { data: notes, refetch: refetchNotes } = useQuery({
    queryKey: ["notes", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/all_notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const result = await res.json();

      return result.data;
    },
  });

  const handleAddTag = useMutation({
    mutationFn: async ({ pageX, pageY }: { pageX: number; pageY: number }) => {
      const newTag = {
        userId: user.id,
        note: { title: "Пустая заметка", body: "Тело заметки..." },
        desk: true,
        x: pageX,
        y: pageY,
        createdAt: Date.now(),
      };

      const res = await fetch("/api/note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTag),
      });

      return res.json();
    },

    onSuccess: (data) => {
      setTags((prev) => [...prev, { ...data, isActive: false }]);
      refetchNotes();
    },
  });

  const handleSetDesk = useMutation({
    mutationFn: async ({ id, desk }: { id: number; desk: boolean }) => {
      const res = await fetch(`/api/note/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ desk: !desk }),
      });

      return res.json();
    },

    onSuccess: (data) => {
      refetchNotes();
    },
  });

  const handleEditTag = useMutation({
    mutationFn: async ({
      id,
      x,
      y,
      title,
      body,
      desk,
    }: {
      id: number;
      title?: string;
      body?: string;
      desk?: boolean;
      x?: number;
      y?: number;
    }) => {
      const updateData: any = {};

      if (x !== undefined) updateData.x = x;
      if (y !== undefined) updateData.y = y;
      if (title !== undefined) updateData.title = title;
      if (body !== undefined) updateData.body = body;
      if (desk !== undefined) updateData.desk = desk;

      if (Object.keys(updateData).length === 0) {
        const currentTag = tags.find((tag) => tag.id === id);
        return currentTag;
      }

      const res = await fetch(`/api/note/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return res.json();
    },

    onSuccess: (data) => {
      setTags((prev) =>
        prev.map((tag) =>
          tag.id === data.id ? { ...data, isActive: tag.isActive } : tag
        )
      );
      refetchNotes();
    },

    onError: (error) => {
      console.error("Failed to update tag:", error);
    },
  });

  const handleDeleteNote = useMutation({
    mutationFn: async (id: string) => {
      await deleteNote(id);
    },
    onSuccess: () => {
      refetchNotes();
    },
  });

  const handleChangeFocus = (id: string) => {
    if (activeNote?.id === +id) {
      return;
    }

    if (activeNote?.id && !noteLoading) {
      handleEditTag.mutate({
        id: activeNote.id,
        title: activeNote.title,
        body: activeNote.body,
      });
    }

    dispatch(fetchNote(id));
    setTags((prevTags) =>
      prevTags.map((tag) => ({
        ...tag,
        isActive: tag.id === id,
      }))
    );
  };

  useEffect(() => {
    if (notes) {
      const allTags = notes
        ?.filter((tag: Note) => tag.desk)
        ?.map((tag: Note) => ({ ...tag, isActive: false }));
      setTags(allTags || []);
    }
  }, [notes]);

  const handleDeskClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".tag")) {
      return;
    }

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    if (timeSinceLastClick < 300) {
      handleAddTag.mutate(e);
      setLastClickTime(0);
    } else {
      setLastClickTime(now);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".tag-editable")) {
        if (activeNote?.id && !noteLoading) {
          handleEditTag.mutate({
            id: activeNote.id,
            title: activeNote.title,
            body: activeNote.body,
          });
        }
        dispatch(resetNote());
        resetActiveTags();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeNote, noteLoading]);

  const resetActiveTags = () => {
    setTags((prevTags) => prevTags.map((tag) => ({ ...tag, isActive: false })));
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TAG,
    drop: (item: Note, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        moveTag(item.id, offset.x, offset.y);
      }
      return {};
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const moveTag = (id, left, top) => {
    setTags((prevTags) =>
      prevTags.map((tag) => {
        if (tag.id === id) {
          const updatedTag = { ...tag, x: left, y: top };
          handleEditTag.mutate({ id: tag.id, x: left, y: top });
          return updatedTag;
        }
        return tag;
      })
    );
  };

  drop(tagRef);

  const handleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleNotePreviewClick = (id: number, desk: boolean) => {
    handleSetDesk.mutate({ id, desk });
    setTags((prev) =>
      prev.map((tag) => (tag.id === id ? { ...tag, desk: !tag.desk } : tag))
    );
  };

  return (
    <div className="desk-container">
      <div>
        <button className="expand" onClick={handleExpand}>
          ☰
        </button>
        {isExpanded && (
          <aside className="desk-aside">
            {notes?.length > 0 ? (
              notes.map((note) => (
                <NotePreview
                  onNotePreviewClick={(id, desk) =>
                    handleNotePreviewClick(id, desk)
                  }
                  key={note.id}
                  {...note}
                  userId={7}
                  onDelete={(id) => handleDeleteNote.mutate(id)}
                />
              ))
            ) : (
              <div>Заметки не найдены</div>
            )}
          </aside>
        )}
      </div>

      <div className="desk" onClick={handleDeskClick} ref={tagRef}>
        {tags.map((tag) => (
          <Tag key={tag.id} {...tag} onFocusChange={handleChangeFocus} />
        ))}
      </div>
    </div>
  );
}

export default Desk;
