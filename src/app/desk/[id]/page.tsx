"use client";

import NotePreview from "@/components/NotePreview";
import Tag from "@/components/Tag";
import { AuthContext } from "@/providers/AuthProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useRef, useState } from "react";
import { ItemTypes, socketActions } from "@utils/config";
import "@app/desk/style.css";
import { useDrop } from "react-dnd";
import { INote, Note } from "@/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchNote, resetNote, setFullNote } from "@/slices/noteSlice";
import { deleteNote } from "@/utils/apiUtil";
import Button from "@/components/Button";
import HamburgerMenuIcon from "@/assets/HamburgerMenuIcon";
import ArrowLeftIcon from "@/assets/ArrowIcon";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import * as Y from "yjs";

function Desk() {
  const { id } = useParams();

  const [deskId, setDeskId] = useState(null);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const { data: activeNote, loading: noteLoading } = useSelector(
    (state: RootState) => state.note
  );
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const tagRef = useRef(null);

  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const activeNoteRef = useRef(activeNote);

  useEffect(() => {
    activeNoteRef.current = activeNote;
  }, [activeNote]);

  useEffect(() => {
    const socket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on(socketActions.CHANGE, (data) => {
      if (data.id) {
        setTags((prevTags) =>
          prevTags.map((tag) => {
            if (tag.id === data.id) {
              return {
                ...tag,
                [data.name]: data.value,
              };
            }
            return tag;
          })
        );

        if (activeNoteRef.current?.id === data.id) {
          dispatch(
            setFullNote({
              ...activeNoteRef.current,
              [data.name]: data.value,
            })
          );
        }
      }
    });

    socket.on(socketActions.ADD, (data) => {
      setTags((prev) => [...prev, { ...data, isActive: false }]);
    });

    socket.on(socketActions.DELETE, (data) => {
      setTags((prev) => prev.filter((tag) => tag.id !== data.id));
      refetchNotes();
    });

    socket.on(socketActions.MOVE, (data) => {
      setTags((prev) => prev.map((tag) => (tag.id === data.id ? data : tag)));
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [dispatch]);

  const handleAddTag = useMutation({
    mutationFn: async ({ pageX, pageY }: { pageX: number; pageY: number }) => {
      const newTag = {
        userId: user.id,
        note: { title: "Пустая заметка", body: "Тело заметки..." },
        desk: true,
        x: pageX,
        y: pageY,
        deskId: deskId,
        createdAt: Date.now(),
      };

      const res = await fetch("/api/note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTag),
      });

      const result = await res.json();
      return result.data;
    },

    onSuccess: (data) => {
      sendSocketMessage(socketActions.ADD, data);
      refetchNotes();
    },
  });

  const {
    data: notes,
    refetch: refetchNotes,
    isLoading: isNotesLoading,
  } = useQuery({
    queryKey: ["notes", user?.id, id],
    queryFn: async () => {
      const res = await fetch(`/api/all_notes/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      setDeskId(result.data.deskId);
      return result.data.notes;
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

      const result = await res.json();
      return result.data;
    },

    onSuccess: (data) => {
      setTags((prev) =>
        prev.map((tag) =>
          tag.id === data.id ? { ...data, isActive: tag.isActive } : tag
        )
      );
    },

    onError: (error) => {
      console.error("Failed to update tag:", error);
    },
  });

  const handleDeleteNote = useMutation({
    mutationFn: async (id: number) => {
      await deleteNote(id);
    },
    onSuccess: (data, variables) => {
      const deletedId = variables;
      sendSocketMessage(socketActions.DELETE, { id: deletedId });
      setTags((prev) => prev.filter((tag) => tag.id !== deletedId));
    },
  });

  const handleChangeFocus = async (id: number) => {
    if (activeNote?.id === id) {
      return;
    }

    if (activeNote?.id && !noteLoading) {
      await handleEditTag.mutateAsync({
        id: activeNote.id,
        title: activeNote.title,
        body: activeNote.body,
      });
    }

    await dispatch(fetchNote(id));

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
      moveTag(item.id, offset.x, offset.y);
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
          sendSocketMessage(socketActions.MOVE, updatedTag);
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

  const backToDesks = () => {
    router.replace("/desk");
  };

  return (
    <div className="desk-container">
      <div>
        <Button
          type="button"
          onButtonClick={handleExpand}
          Icon={HamburgerMenuIcon}
        ></Button>

        <Button
          type="button"
          onButtonClick={backToDesks}
          Icon={ArrowLeftIcon}
        ></Button>

        {isExpanded && (
          <aside className="desk-aside">
            {isNotesLoading ? (
              <div>Loading...</div>
            ) : (
              <>
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
              </>
            )}
          </aside>
        )}
      </div>

      <div className="desk" onClick={handleDeskClick} ref={tagRef}>
        {tags?.map((tag) => (
          <Tag
            key={tag.id}
            tag={tag}
            onFocusChange={handleChangeFocus}
            io={socketRef.current}
          />
        ))}
      </div>
    </div>
  );

  function sendSocketMessage(type: string, payload: any) {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(type, payload);
    }
  }
}

export default Desk;
