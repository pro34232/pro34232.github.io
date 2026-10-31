import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    HeadContent: () => null,
    Scripts: () => <script data-testid="start-scripts" />,
  };
});

import { RootShell } from "@/routes/__root";

function Field() {
  const [value, setValue] = useState("");
  return <input aria-label="Fuel needs" value={value} onChange={(event) => setValue(event.currentTarget.value)} />;
}

afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe("GitHub Pages document shell", () => {
  it("keeps the existing document outside the React mount so inputs accept events", () => {
    vi.stubEnv("GITHUB_PAGES", true);
    const { container } = render(<RootShell><Field /></RootShell>);
    expect(container.querySelector("html,head,body")).toBeNull();
    expect(screen.queryByTestId("start-scripts")).toBeNull();
    const field = screen.getByRole("textbox", { name: "Fuel needs" });
    field.focus();
    fireEvent.change(field, { target: { value: "Generator fuel" } });
    expect(field).toHaveValue("Generator fuel");
    expect(field).toHaveFocus();
  });
});