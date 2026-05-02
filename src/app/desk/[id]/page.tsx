"use client";

import NotePreview from "@/components/NotePreview";
import Tag from "@/components/Tag";
import { AuthContext } from "@/providers/AuthProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ItemTypes, socketActions } from "@utils/config";
import "@app/desk/style.css";
import { useDrop } from "react-dnd";
import { ITag, Note } from "@/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchNote, resetNote, setFullNote } from "@/slices/noteSlice";
import { deleteNote } from "@/utils/apiUtil";
import Button from "@/components/Button";
import HamburgerMenuIcon from "@/assets/HamburgerMenuIcon";
import ArrowLeftIcon from "@/assets/ArrowIcon";
import { useParams, useRouter } from "next/navigation";
import Preview from "@/components/Preview";
import { SocketContext } from "@/providers/SocketProvider";
import { Stage, Layer, Text, Shape, Group, Rect } from "react-konva";
import KonvaTag from "@/components/KonvaTag";
import ActiveTag from "@/components/ActiveTag";

function Desk() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { socket, isConnected, sendSocketMessage } = useContext(SocketContext);
  const [deskId, setDeskId] = useState(null);
  const [tags, setTags] = useState([]);

  const [stageState, setStageState] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { data: activeNote, loading: noteLoading } = useSelector(
    (state: RootState) => state.note
  );

  const deskTags = useMemo(() => {
    return tags?.filter((tag: ITag) => tag.desk);
  }, [tags]);

  const [lastClickTime, setLastClickTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  const [isNoteFullScreen, setNoteFullScreen] = useState(null);
  const tagDragRef = useRef(null);

  const activeNoteRef = useRef(activeNote);
  var stageRef = useRef(null);

  var scaleBy = 1.05;

  var handleWheel = function (e) {
    e.evt.preventDefault();
    var stage = stageRef.current;
    var oldScale = stage.scaleX();
    var pointer = stage.getPointerPosition();
    var mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    var direction = e.evt.deltaY > 0 ? -1 : 1;
    if (e.evt.ctrlKey) {
      direction = -direction;
    }
    var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.1, Math.min(10, newScale));

    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
    setStageState({
      x: stage.x(),
      y: stage.y(),
      scale: stage.scaleX(),
    });
  };

  useEffect(() => {
    activeNoteRef.current = activeNote;
  }, [activeNote]);

  useEffect(() => {
    if (deskId && isConnected) {
      sendSocketMessage("join desk", { deskId, username: user.username });
    }
  }, [isConnected, deskId]);

  useEffect(() => {
    const handleChange = ({ id, name, value, deskId }) => {
      if (id) {
        setTags((prevTags) => {
          const newTags = prevTags.map((tag) => {
            if (tag.id === id) {
              return {
                ...tag,
                [name]: value,
              };
            }
            return tag;
          });

          if (activeNoteRef.current?.id === id) {
            dispatch(
              setFullNote({
                ...activeNoteRef.current,
                [name]: value,
              })
            );
          }

          return newTags;
        });
      }
    };

    const handleAdd = (data) => {
      console.log("1");
      setTags((prev) => [...prev, { ...data, isActive: false }]);
    };

    const handleDelete = ({ id, _ }) => {
      setTags((prev) => prev.filter((tag) => tag.id !== id));
    };

    const handleMove = (data) => {
      setTags((prev) =>
        prev.map((tag) =>
          tag.id === data.id ? { ...tag, x: data.x, y: data.y } : tag
        )
      );
    };

    const handleJoined = (data) => {
      console.log(`${data.username} has joined desk with id ${data.deskId}`);
    };

    socket.on(socketActions.CHANGE, handleChange);
    socket.on(socketActions.ADD, handleAdd);
    socket.on(socketActions.DELETE, handleDelete);
    socket.on(socketActions.MOVE, handleMove);
    socket.on("joined", handleJoined);

    return () => {
      socket.off(socketActions.CHANGE, handleChange);
      socket.off(socketActions.ADD, handleAdd);
      socket.off(socketActions.DELETE, handleDelete);
      socket.off(socketActions.MOVE, handleMove);
      socket.off("joined", handleJoined);
    };
  }, [dispatch, deskId, socket]);

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

  useEffect(() => {
    if (!isNotesLoading) {
      const allTags = notes?.map((tag: Note) => ({ ...tag, isActive: false }));
      setTags(allTags || []);
    }
  }, [isNotesLoading]);

  const handleSetDesk = useMutation({
    mutationFn: async ({
      id,
      desk,
    }: {
      id: number | string;
      desk: boolean;
    }) => {
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

      sendSocketMessage(socketActions.DELETE, { id: deletedId, deskId });
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

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.TAG,
      drop: (item: ITag, monitor) => {
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;

        const pos = screenToCanvas(clientOffset.x, clientOffset.y);
        moveTag(item.id, pos.x, pos.y);
        console.log("move", pos.x, pos.y);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [deskId, isConnected]
  );

  const moveTag = (id: number, left: number, top: number, isWheel = false) => {
    setTags((prevTags) =>
      prevTags.map((tag) => (tag.id === id ? { ...tag, x: left, y: top } : tag))
    );
    if (!isWheel) {
      handleEditTag.mutate({ id, x: left, y: top });
    }

    sendSocketMessage(socketActions.MOVE, { id, x: left, y: top, deskId });
  };

  drop(tagDragRef);

  const handleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  useEffect(() => {
    if (!activeNote.id && noteLoading) {
      handleGoBackToDesk();
    }
  }, [activeNote.id, noteLoading]);

  const handleNotePreviewClick = async (id: number | string, desk: boolean) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    if (timeSinceLastClick < 300) {
      setLastClickTime(0);
      handleSetDesk.mutate({ id, desk });
      setTags((prev) =>
        prev.map((tag) => (tag.id === id ? { ...tag, desk: !tag.desk } : tag))
      );
    } else {
      console.log(isNoteFullScreen);
      setNoteFullScreen((prev) => !prev);
      if (activeNote.id !== id) {
        await dispatch(fetchNote(id));
      }

      setLastClickTime(now);
    }
  };

  const backToDesks = () => {
    router.replace("/desk");
  };

  const handleGoBackToDesk = () => {
    setNoteFullScreen(false);
  };

  const screenToCanvas = useCallback((x: number, y: number) => {
    const stage = stageRef.current;
    if (!stage) return { x, y };

    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point({ x, y });
  }, []);

  const canvasToScreen = (canvasX, canvasY) => {
    const stage = stageRef.current;
    const transform = stage.getAbsoluteTransform();
    return transform.point({ x: canvasX, y: canvasY });
  };

  return (
    <>
      <div className="side-container">
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
                {tags?.length > 0 ? (
                  tags.map((tag) => (
                    <Preview
                      key={tag.id}
                      id={tag.id}
                      {...tag}
                      onDelete={(id) => handleDeleteNote.mutate(id)}
                      onClick={(id, desk) => handleNotePreviewClick(id, desk)}
                      onDoubleClick={() => console.log("double click")}
                      type="note"
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
      <div className="desk-container">
        {isNoteFullScreen ? (
          <NotePreview
            tag={activeNote}
            onBackButtonClick={handleGoBackToDesk}
          />
        ) : (
          <div
            className="desk"
            id="desk"
            onDoubleClick={(e) => {
              if (!(e.target as HTMLElement).closest(".tag")) {
                const pos = screenToCanvas(e.clientX, e.clientY);
                handleAddTag.mutate({
                  pageX: Math.floor(pos.x),
                  pageY: Math.floor(pos.y),
                });
              }
            }}
            ref={tagDragRef}
          >
            <Stage
              ref={stageRef}
              width={2000}
              height={2000}
              x={stageState.x}
              y={stageState.y}
              scaleX={stageState.scale}
              scaleY={stageState.scale}
              onWheel={handleWheel}
              draggable
            >
              <Layer>
                <Shape
                  sceneFunc={(ctx, shape) => {
                    const spacing = 40;
                    const range = 2000;

                    ctx.fillStyle = "#ccc";

                    for (let x = -range; x <= range; x += spacing) {
                      for (let y = -range; y <= range; y += spacing) {
                        ctx.fillRect(x, y, 1, 1);
                      }
                    }
                  }}
                />
                {deskTags
                  ?.filter((tag) => tag.id !== activeNote.id)
                  .map((tag) => (
                    <KonvaTag
                      key={tag.id}
                      tag={tag}
                      onFocusChange={handleChangeFocus}
                      onDragEnd={moveTag}
                    />
                  ))}
              </Layer>
            </Stage>

            {activeNote.id && (
              <ActiveTag
                tag={{
                  ...activeNote,
                  ...canvasToScreen(activeNote.x, activeNote.y),
                }}
                scale={stageState.scale}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Desk;
