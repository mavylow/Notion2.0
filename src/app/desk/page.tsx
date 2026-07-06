"use client";

import { AuthContext, IAuthContext } from "@/providers/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useRef, useState } from "react";
import "@app/desk/style.css";
import { TDesk } from "@/interfaces";
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
  const { user } = useContext<IAuthContext>(AuthContext);
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(true);

  const { data: desks = [], isLoading } = useQuery({
    queryKey: ["desks", user?.id],
    queryFn: async () => {
      const result = await getDesks();
      return result;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  const addDesk = useMutation({
    mutationFn: async (desk: TDesk) => {
      await createDesk(desk);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["desks", user?.id] });
    },
  });

  const deleteDesk = useMutation({
    mutationFn: async (id: number) => {
      await deleteDeskById(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["desks", user?.id] });
    },
  });

  const handleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleAddDesk = (desk: TDesk) => {
    addDesk.mutate(desk);
  };

  const handleDeleteDesk = (id: number) => {
    const isDeleteConfirm = confirm("Are you sure you want to delete this app");
    if (isDeleteConfirm) {
      deleteDesk.mutate(id);
    }
  };

  if (isLoading || !user) {
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

        {isExpanded && desks && desks.length > 0 && (
          <aside className="desk-aside-">
            {desks.map((desk) => {
              console.log("Rendering desk:", desk);
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

        {isExpanded && desks.length === 0 && (
          <aside className="desk-aside-">
            <p>{t("noDesks")}</p>
          </aside>
        )}
      </div>
    </div>
  );
}

export default DeskList;
