import "@components/SidebarElement/style.css";
import type { IGroup, ISidebarUser } from "@/interfaces";
import Image from "next/image";

interface SidebarElementProps {
  element: IGroup | ISidebarUser;
}

export function SidebarElement({ element }: SidebarElementProps) {
  if ("membersCount" in element) {
    return (
      <div className="aside-element">
        <Image
          src={element.photo}
          alt="suggested group avatar image"
          height={48}
          width={48}
        />
        <h3>{element.title}</h3>
        <span>{element.membersCount}</span>
      </div>
    );
  }

  if ("username" in element) {
    return (
      <div className="aside-element">
        <Image
          src={element.profileImage || "/assets/default.png"}
          alt="suggested user avatar image"
          height={48}
          width={48}
        />
        <h3>
          {element.firstName} {element.secondName}
        </h3>
        <span>@{element.username}</span>
      </div>
    );
  }
}
