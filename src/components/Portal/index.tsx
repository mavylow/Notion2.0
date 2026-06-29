"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface IPortalProps {
  children: ReactNode;
}

function Portal({ children }: IPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  const modalRoot = document.getElementById("modal");

  if (!modalRoot) {
    console.warn("Element with id 'modal' not found");
    return null;
  }

  return createPortal(<>{children}</>, modalRoot);
}

export default Portal;
