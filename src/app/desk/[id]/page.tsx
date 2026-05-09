"use client";

import NotePreview from "@/components/NotePreview";
import { AuthContext } from "@/providers/AuthProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { socketActions } from "@utils/config";
import "@app/desk/style.css";
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
import { Stage, Layer, Shape } from "react-konva";
import Tag from "@/components/Tag";
import ActiveTag from "@/components/ActiveTag";

function Desk() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { socket, isConnected, sendSocketMessage } = useContext(SocketContext);

  const [deskId, setDeskId] = useState(null);
  const [tags, setTags] = useState([]);

  const [stageSize, setStageSize] = useState({ width: 2000, height: 2000 });

  const [stageState, setStageState] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [lastCenter, setLastCenter] = useState(null);
  const [lastDist, setLastDist] = useState(0);
  const [dragStopped, setDragStopped] = useState(false);

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

  const activeNoteRef = useRef(activeNote);
  const stageRef = useRef(null);
  const deskContainerRef = useRef(null);

  const scaleBy = 1.05;

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(
      0.1,
      Math.min(10, direction > 0 ? oldScale * scaleBy : oldScale / scaleBy)
    );

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
  }, []);

  useEffect(() => {
    activeNoteRef.current = activeNote;
  }, [activeNote]);

  useEffect(() => {
    if (deskId && isConnected && user) {
      sendSocketMessage("join desk", { deskId, username: user.username });
    }
  }, [isConnected, deskId, user, sendSocketMessage]);

  useEffect(() => {
    if (!isConnected) return;

    const handleChange = ({ id, name, value }) => {
      if (id) {
        setTags((prevTags) => {
          const newTags = prevTags.map((tag) => {
            if (tag.id === id) {
              return { ...tag, [name]: value };
            }
            return tag;
          });

          if (activeNoteRef.current?.id === id) {
            setTimeout(() => {
              dispatch(
                setFullNote({ ...activeNoteRef.current, [name]: value })
              );
            }, 0);
          }

          return newTags;
        });
      }
    };

    const handleAdd = (data) => {
      setTags((prev) => [...prev, { ...data, isActive: false }]);
    };

    const handleDelete = ({ id }) => {
      setTags((prev) => prev.filter((tag) => tag.id !== id));
    };

    const handleResize = ({ id, height, width }) => {
      setTags((prevTags) => {
        const newTags = prevTags.map((tag) => {
          if (tag.id === id) {
            const safeHeight = Math.max(Number(height) || 160, 100);
            const safeWidth = Math.max(Number(width) || 220, 100);
            return {
              ...tag,
              height: safeHeight,
              width: safeWidth,
            };
          }
          return tag;
        });

        if (activeNoteRef.current?.id === id) {
          const safeHeight = Math.max(Number(height) || 160, 100);
          const safeWidth = Math.max(Number(width) || 220, 100);
          setTimeout(() => {
            dispatch(
              setFullNote({
                ...activeNoteRef.current,
                height: safeHeight,
                width: safeWidth,
              })
            );
          }, 0);
        }

        return newTags;
      });
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
    socket.on(socketActions.RESIZE, handleResize);
    socket.on(socketActions.ADD, handleAdd);
    socket.on(socketActions.DELETE, handleDelete);
    socket.on(socketActions.MOVE, handleMove);
    socket.on("joined", handleJoined);

    return () => {
      socket.off(socketActions.CHANGE, handleChange);
      socket.off(socketActions.RESIZE, handleResize);
      socket.off(socketActions.ADD, handleAdd);
      socket.off(socketActions.DELETE, handleDelete);
      socket.off(socketActions.MOVE, handleMove);
      socket.off("joined", handleJoined);
    };
  }, [isConnected, socket, dispatch]);

  const handleAddTag = useMutation({
    mutationFn: async ({ pageX, pageY }: { pageX: number; pageY: number }) => {
      const newTag = {
        userId: user.id,
        note: { title: "Пустая заметка", body: "Тело заметки..." },
        desk: true,
        x: pageX,
        y: pageY,
        height: 160,
        width: 220,
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
    throwOnError: (error) => {
      console.error(error);
      return true;
    },
  });

  useEffect(() => {
    if (!isNotesLoading) {
      const allTags = notes?.map((tag: Note) => ({ ...tag, isActive: false }));
      setTags(allTags || []);
    }
  }, [isNotesLoading, notes]);

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
    onSuccess: () => {
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
      height,
      width,
    }: {
      id: number;
      title?: string;
      body?: string;
      desk?: boolean;
      x?: number;
      y?: number;
      height?: number;
      width?: number;
    }) => {
      const updateData: any = {};

      if (x !== undefined) updateData.x = x;
      if (y !== undefined) updateData.y = y;
      if (title !== undefined) updateData.title = title;
      if (body !== undefined) updateData.body = body;
      if (desk !== undefined) updateData.desk = desk;
      if (height !== undefined) updateData.height = height;
      if (width !== undefined) updateData.width = width;

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
  });

  const handleDeleteNote = useMutation({
    mutationFn: async (id: number) => {
      await deleteNote(id);
    },
    onSuccess: (_, variables) => {
      const deletedId = variables;
      sendSocketMessage(socketActions.DELETE, { id: deletedId, deskId });
      setTags((prev) => prev.filter((tag) => tag.id !== deletedId));
    },
  });

  const handleChangeFocus = async (id: number) => {
    if (activeNote?.id === id) return;

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
          const editableElement = document.querySelector(
            ".tag-editable"
          ) as HTMLElement;
          if (editableElement) {
            const { height, width } = editableElement.getBoundingClientRect();

            sendSocketMessage(socketActions.RESIZE, {
              id: activeNote.id,
              height: Math.round(height / stageState.scale),
              width: Math.round(width / stageState.scale),
              deskId,
            });

            handleEditTag.mutate({
              id: activeNote.id,
              title: activeNote.title,
              body: activeNote.body,
              height: Math.round(height / stageState.scale),
              width: Math.round(width / stageState.scale),
            });
          }
        }
        dispatch(resetNote());
        resetActiveTags();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeNote, noteLoading, deskId, sendSocketMessage, dispatch]);

  const resetActiveTags = () => {
    setTags((prevTags) => prevTags.map((tag) => ({ ...tag, isActive: false })));
  };

  const moveTag = (id: number, left: number, top: number) => {
    setTags((prevTags) =>
      prevTags.map((tag) => (tag.id === id ? { ...tag, x: left, y: top } : tag))
    );

    handleEditTag.mutate({ id, x: left, y: top });
    sendSocketMessage(socketActions.MOVE, { id, x: left, y: top, deskId });
  };

  const handleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

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
      setLastClickTime(now);
      handleSetDesk.mutate({ id, desk });
      setTags((prev) =>
        prev.map((tag) => (tag.id === id ? { ...tag, desk: !tag.desk } : tag))
      );
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

  const getDistance = (p1, p2) => {
    return Math.sqrt(
      (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y)
    );
  };

  const getCenter = (p1, p2) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  };

  const handleTouchMove = useCallback(
    (e) => {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      if (!stage) return;

      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];

      if (touch1 && !touch2 && !stage.isDragging() && dragStopped) {
        stage.startDrag();
        setDragStopped(false);
      }

      if (touch1 && touch2) {
        e.evt.preventDefault();

        if (stage.isDragging()) {
          stage.stopDrag();
          setDragStopped(true);
        }

        const rect = stage.container().getBoundingClientRect();

        const p1 = {
          x: touch1.clientX - rect.left,
          y: touch1.clientY - rect.top,
        };

        const p2 = {
          x: touch2.clientX - rect.left,
          y: touch2.clientY - rect.top,
        };

        const newCenter = getCenter(p1, p2);
        const dist = getDistance(p1, p2);

        if (!lastCenter) {
          setLastCenter(newCenter);
          setLastDist(dist);
          return;
        }

        if (lastDist === 0) {
          setLastDist(dist);
          return;
        }

        const pointTo = {
          x: (newCenter.x - stageState.x) / stageState.scale,
          y: (newCenter.y - stageState.y) / stageState.scale,
        };

        const scaleFactor = dist / lastDist;
        const newScale = Math.max(
          0.1,
          Math.min(10, stageState.scale * scaleFactor)
        );

        const dx = newCenter.x - lastCenter.x;
        const dy = newCenter.y - lastCenter.y;

        setStageState({
          scale: newScale,
          x: newCenter.x - pointTo.x * newScale + dx,
          y: newCenter.y - pointTo.y * newScale + dy,
        });

        setLastDist(dist);
        setLastCenter(newCenter);
      } else if (touch1 && !touch2) {
        setLastCenter(null);
        setLastDist(0);
      }
    },
    [lastCenter, lastDist, stageState]
  );

  const handleTouchEnd = () => {
    setLastDist(0);
    setLastCenter(null);
  };

  const handleDragEnd = (e) => {
    setDragStopped(false);
    const stage = e.target.getStage();

    setStageState((prev) => ({
      ...prev,
      x: stage.x(),
      y: stage.y(),
    }));
  };

  return (
    <>
      <div className={`side-container ${isExpanded ? "open" : ""}`}>
        <div className="actions-desk">
          <Button
            type="button"
            onButtonClick={backToDesks}
            Icon={ArrowLeftIcon}
          />
          <Button
            type="button"
            onButtonClick={handleExpand}
            Icon={HamburgerMenuIcon}
          />
        </div>

        {isExpanded && (
          <aside className="desk-aside">
            {isNotesLoading ? (
              <div className="loading-state">Loading...</div>
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
                  <div className="empty-state">Заметки не найдены</div>
                )}
              </>
            )}
          </aside>
        )}
      </div>
      <div className="desk-container" ref={deskContainerRef}>
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
          >
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              x={stageState.x}
              y={stageState.y}
              scaleX={stageState.scale}
              scaleY={stageState.scale}
              onWheel={handleWheel}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDragEnd={handleDragEnd}
              draggable
            >
              <Layer>
                <Shape
                  sceneFunc={(ctx) => {
                    const spacing = 40;
                    const range = 5000;

                    const borderColor = getComputedStyle(
                      document.documentElement
                    )
                      .getPropertyValue("--text-color")
                      .trim();

                    ctx.fillStyle = borderColor;

                    for (let x = -range; x <= range; x += spacing) {
                      for (let y = -range; y <= range; y += spacing) {
                        ctx.fillRect(x, y, 1, 1);
                      }
                    }
                  }}
                />
                {deskTags.map((tag) =>
                  tag.id === activeNote.id ? (
                    <ActiveTag key={tag.id} tag={activeNote} />
                  ) : (
                    <Tag
                      key={tag.id}
                      tag={tag}
                      onFocusChange={handleChangeFocus}
                      onDragEnd={moveTag}
                    />
                  )
                )}
              </Layer>
            </Stage>
          </div>
        )}
      </div>
    </>
  );
}

export default Desk;
