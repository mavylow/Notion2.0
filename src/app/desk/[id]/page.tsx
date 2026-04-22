"use client";

import NotePreview from "@/components/NotePreview";
import Tag from "@/components/Tag";
import { AuthContext } from "@/providers/AuthProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useRef, useState } from "react";
import { ItemTypes } from "@utils/config";
import "@app/desk/style.css";
import { useDrop, XYCoord } from "react-dnd";
import { IDesk, Note } from "@/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchNote, resetNote } from "@/slices/noteSlice";
import { deleteNote } from "@/utils/apiUtil";
import Button from "@/components/Button";
import HamburgerMenuIcon from "@/assets/HamburgerMenuIcon";
import ArrowLeftIcon from "@/assets/ArrowIcon";

import { useParams, useRouter } from "next/navigation";

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

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    wsRef.current = new WebSocket("ws://localhost:1234");

    wsRef.current.onopen = () => {
      console.log("✅ WebSocket connected");

      wsRef.current?.send(
        JSON.stringify({
          type: "auth",
          userId: user?.id,
          room: "desk",
        })
      );
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 Message received:", data);

        switch (data.type) {
          case "notification":
            console.log("Notification:", data.message);
            break;
          case "sync":
            console.log("Sync data:", data.payload);
            break;

          case "note_created":
            refetchNotes();
          case "note_changed":
            refetchNotes();
            break;
          default:
            console.log("Unknown message type:", data);
        }
      } catch {
        console.log("📨 Raw message:", event.data);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    wsRef.current.onclose = () => {
      console.log("🔌 WebSocket disconnected");
    };

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [user?.id]);

  // useEffect(() => {
  //   if (!user?.id) return;

  //   ydocRef.current = new Y.Doc();

  //   yjsProviderRef.current = new WebsocketProvider(
  //     "ws://localhost:1235",
  //     `desk-${user.id}`,
  //     ydocRef.current
  //   );

  //   yjsProviderRef.current.on("status", (event) => {
  //     console.log("Yjs WebSocket status:", event.status);
  //   });

  //   yjsProviderRef.current.on("connection-error", (error) => {
  //     console.error("Yjs connection error:", error);
  //   });

  //   const yText = ydocRef.current.getText("desk-content");
  //   yText.observe(() => {
  //     console.log("Document changed:", yText.toString());
  //   });

  //   return () => {
  //     yjsProviderRef.current?.destroy();
  //     ydocRef.current?.destroy();
  //   };
  // }, [user?.id]);

  const sendWebSocketMessage = (type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn("WebSocket is not connected");
    }
  };

  const notifyNoteCreated = (note: any) => {
    sendWebSocketMessage("note_created", {
      noteId: note.id,
      userId: user?.id,
      timestamp: Date.now(),
    });
  };

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

      return res.json();
    },

    onSuccess: (data) => {
      setTags((prev) => [...prev, { ...data, isActive: false }]);
      refetchNotes();
      notifyNoteCreated(data);
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
      sendWebSocketMessage("note_changed", data);
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
    mutationFn: async (id: number) => {
      await deleteNote(id);
    },
    onSuccess: () => {
      refetchNotes();
    },
  });

  const handleChangeFocus = (id: number) => {
    if (activeNote?.id === id) {
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
      console.log(offset);
      // if (checkPosition(item, offset)) {
      //   moveTag(item.id, offset.x, offset.y);
      // }
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
          handleEditTag.mutate({ id: tag.id, x: left, y: top });
          return updatedTag;
        }
        return tag;
      })
    );
  };

  // const checkPosition = (item: Note, offset: XYCoord) => {
  //   if (!tagRef.current) return true;

  //   const deskRect = tagRef.current.getBoundingClientRect();
  //   const tagElement = document.getElementById("" + item.id);

  //   if (!tagElement) return true;

  //   const tagRect = tagElement.getBoundingClientRect();

  //   if (offset.x + tagRect.width / 2 > deskRect.right) {
  //     return false;
  //   }

  //   if (offset.x - tagRect.width / 2 < deskRect.left) {
  //     return false;
  //   }

  //   if (offset.y + tagRect.height / 2 > deskRect.bottom) {
  //     return false;
  //   }

  //   if (offset.y - tagRect.height / 2 < deskRect.top) {
  //     return false;
  //   }

  //   return true;
  // };

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
          <Tag key={tag.id} tag={tag} onFocusChange={handleChangeFocus} />
        ))}
      </div>
    </div>
  );
}

export default Desk;
