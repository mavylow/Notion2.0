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
import { ITag, INote } from "@/interfaces";
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
import ZoomInIcon from "@/assets/ZoomInIcon";
import ZoomOutIcon from "@/assets/ZoomOutIcon";
import MaximizeIcon from "@/assets/MaximizeIcon";

function Desk() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { socket, isConnected, sendSocketMessage } = useContext(SocketContext);

  const [deskId, setDeskId] = useState(null);
  const [tags, setTags] = useState([]);

  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState({ x: 1, y: 1 });

  const lastCenterRef = useRef(null);
  const lastDistRef = useRef(0);
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

  useEffect(() => {
    if (!user) {
      sessionStorage.setItem("redirectAfterAuth", `/desk/${id}`);
      router.replace("/signup");
    }
  }, [user, id, router]);

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

    setStagePos({ x: stage.x(), y: stage.y() });
    setStageScale({ x: stage.scaleX(), y: stage.scaleY() });
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
        title: "Пустая заметка",
        body: "Тело заметки...",
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
      const allTags = notes?.map((tag: INote) => ({ ...tag, isActive: false }));
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
              height: Math.round(height / stageScale.y),
              width: Math.round(width / stageScale.x),
              deskId,
            });

            handleEditTag.mutate({
              id: activeNote.id,
              title: activeNote.title,
              body: activeNote.body,
              height: Math.round(height / stageScale.y),
              width: Math.round(width / stageScale.x),
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
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      const stage = e.target.getStage();

      if (!stage) return;

      if (touch1 && !touch2 && !stage.isDragging() && dragStopped) {
        stage.startDrag();
        setDragStopped(false);
      }

      if (touch1 && touch2) {
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

        if (!lastCenterRef.current) {
          lastCenterRef.current = getCenter(p1, p2);
          return;
        }

        const newCenter = getCenter(p1, p2);
        const dist = getDistance(p1, p2);

        if (lastDistRef.current === 0) {
          lastDistRef.current = dist;
          return;
        }

        const pointTo = {
          x: (newCenter.x - stage.x()) / stage.scaleX(),
          y: (newCenter.y - stage.y()) / stage.scaleY(),
        };

        const scale = stage.scaleX() * (dist / lastDistRef.current);
        const newScale = Math.max(0.1, Math.min(10, scale));

        stage.scale({ x: newScale, y: newScale });

        const dx = newCenter.x - lastCenterRef.current.x;
        const dy = newCenter.y - lastCenterRef.current.y;

        stage.position({
          x: newCenter.x - pointTo.x * newScale + dx,
          y: newCenter.y - pointTo.y * newScale + dy,
        });

        lastDistRef.current = dist;
        lastCenterRef.current = newCenter;

        stage.batchDraw();
      }
    },
    [dragStopped]
  );

  const handleTouchEnd = () => {
    lastDistRef.current = 0;
    lastCenterRef.current = null;

    const stage = stageRef.current;
    if (stage) {
      setStagePos({ x: stage.x(), y: stage.y() });
      setStageScale({ x: stage.scaleX(), y: stage.scaleY() });
    }
  };

  const handleDragEnd = (e) => {
    setDragStopped(false);
    const stage = e.target.getStage();
    setStagePos({ x: stage.x(), y: stage.y() });
  };

  const handleZoom = useCallback((direction: "in" | "out") => {
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = Math.max(
      0.1,
      Math.min(10, direction === "in" ? oldScale * scaleBy : oldScale / scaleBy)
    );

    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });

    setStagePos({ x: stage.x(), y: stage.y() });
    setStageScale({ x: stage.scaleX(), y: stage.scaleY() });
  }, []);

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
          <Button
            type="button"
            onButtonClick={() => handleZoom("in")}
            Icon={ZoomInIcon}
          />
          <Button
            type="button"
            onButtonClick={() => handleZoom("out")}
            Icon={ZoomOutIcon}
          />
          <Button
            type="button"
            onButtonClick={() => setStageScale({ x: 1, y: 1 })}
            Icon={MaximizeIcon}
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
                console.log("dcl");
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
              width={2000}
              height={2000}
              x={stagePos.x}
              y={stagePos.y}
              scaleX={stageScale.x}
              scaleY={stageScale.y}
              onWheel={handleWheel}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDragEnd={handleDragEnd}
              draggable={true}
              style={{
                touchAction: "none",
              }}
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
