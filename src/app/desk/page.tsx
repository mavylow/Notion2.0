"use client";

import { AuthContext } from "@/providers/AuthProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useRef, useState } from "react";
import "@app/desk/style.css";
import { IDesk } from "@/interfaces";
import { createDesk, deleteDeskById, getDesks } from "@/utils/apiUtil";
import Button from "@/components/Button";
import HamburgerMenuIcon from "@/assets/HamburgerMenuIcon";
import CreateDesk from "@/components/CreateDesk";
import { useRouter } from "next/navigation";
import Preview from "@/components/Preview";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";

function DeskList() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const [isExpanded, setIsExpanded] = useState(true);
  const tagRef = useRef(null);

  const {
    data: desks,
    refetch: refetchDesks,
    isLoading,
  } = useQuery({
    queryKey: ["desks", user?.id],
    queryFn: async () => {
      const result = await getDesks();
      console.log(result);
      return result;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    console.log("mounted");
  }, [desks]);

  const addDesk = useMutation({
    mutationKey: ["desks", user?.id],
    mutationFn: async (desk: IDesk) => {
      await createDesk(desk);
    },
    onSuccess: () => {
      refetchDesks();
    },
  });

  const deleteDesk = useMutation({
    mutationKey: ["desks", user?.id],
    mutationFn: async (id: number) => {
      await deleteDeskById(id);
    },
    onSuccess: () => {
      refetchDesks();
    },
  });

  const handleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleAddDesk = (desk: IDesk) => {
    addDesk.mutate(desk);
  };

  const handleDeleteDesk = (id: number) => {
    const isDeleteConfirm = confirm("Are you sure you want to delete this app");
    if (isDeleteConfirm) {
      deleteDesk.mutate(id);
    }
  };

  if (isLoading) {
    return <CircularProgress aria-label="Loading…" />;
  }

  return (
    <div className="desk-container">
      <div>
        <div className="actions-desk">
          <Button
            type="button"
            onButtonClick={handleExpand}
            Icon={HamburgerMenuIcon}
          ></Button>

          {isExpanded && <CreateDesk onAdd={(desk) => handleAddDesk(desk)} />}
        </div>

        {isExpanded && (
          <aside className="desks-aside">
            {desks?.map((desk) => {
              return (
                <Preview
                  key={desk.id}
                  {...desk}
                  onDelete={(id) => handleDeleteDesk(id)}
                  onClick={(link) => router.push(`desk/${link}`)}
                  type="desk"
                />
              );
            })}
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
