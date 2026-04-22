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
import { createDesk, deleteNote, getDesks } from "@/utils/apiUtil";
import DeskPreview from "@/components/DeskPreview";
import Button from "@/components/Button";
import HamburgerMenuIcon from "@/assets/HamburgerMenuIcon";
import ArrowLeftIcon from "@/assets/ArrowIcon";
import AddIcon from "@/assets/AddIcon";
import CreateDesk from "@/components/CreateDesk";
import { useRouter } from "next/navigation";

function DeskList() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [isExpanded, setIsExpanded] = useState(true);
  const tagRef = useRef(null);

  const { data: desks, refetch: refetchDesks } = useQuery({
    queryKey: ["desks", user?.id],
    queryFn: async () => {
      const result = await getDesks();
      return result;
    },
  });
  const handleAddDesk = useMutation({
    mutationKey: ["desks", user?.id],
    mutationFn: async (desk: IDesk) => {
      await createDesk(desk);
    },
    onSuccess: () => {
      refetchDesks();
    },
  });

  const handleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="desk-container">
      <div>
        <Button
          type="button"
          onButtonClick={handleExpand}
          Icon={HamburgerMenuIcon}
        ></Button>

        <CreateDesk onAdd={(desk) => handleAddDesk.mutate(desk)} />

        {isExpanded && (
          <aside className="desk-aside">
            {desks?.length > 0 ? (
              desks.map((desk) => (
                <DeskPreview
                  onActiveDeskChange={(link) => router.push(`desk/${link}`)}
                  key={desk.id}
                  {...desk}
                  onDelete={(id) => console.log("handleDeleteDesk.mutate(id)")}
                />
              ))
            ) : (
              <div>Доски не найдены</div>
            )}
          </aside>
        )}
      </div>

      <div className="desk" ref={tagRef}>
        <div className="notification">Select desk</div>
      </div>
    </div>
  );
}

export default DeskList;
