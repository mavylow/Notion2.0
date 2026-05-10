import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SidebarElement } from "@components/SidebarElement";
import { mockGroup, mockSideBarUser } from "@/tests/consts";

describe("SidebarElement", () => {
  it("sidebar group", () => {
    const { container } = render(<SidebarElement element={mockGroup} />);
    expect(
      screen.getByRole("heading", { name: /Frontend Group/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/128/)).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it("sidebar user", () => {
    const { container } = render(<SidebarElement element={mockSideBarUser} />);
    expect(screen.getByText(/helena/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Helena Stone/i })
    ).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });
});
