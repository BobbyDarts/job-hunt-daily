// /src/views/NotFound.test.ts

import { screen, render, fireEvent, waitFor } from "@testing-library/vue";
import { describe, it, expect } from "vitest";
import { createRouter, createMemoryHistory } from "vue-router";

import NotFound from "./NotFound.vue";

async function createTestRouter(initialPath = "/nonexistent") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "Home", component: { template: "<div>Home</div>" } },
      { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound },
    ],
  });

  await router.push(initialPath);
  return router;
}

async function renderNotFound() {
  return render(NotFound, {
    global: {
      plugins: [await createTestRouter()],
    },
  });
}

describe("NotFound View", () => {
  it("renders without crashing", async () => {
    const { container } = await renderNotFound();
    expect(container).toBeInTheDocument();
  });

  it("displays the page not found heading", async () => {
    await renderNotFound();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  it("displays the ATS screening message", async () => {
    await renderNotFound();
    expect(
      screen.getByText(
        "Looks like this URL didn't make it past the ATS screening.",
      ),
    ).toBeInTheDocument();
  });

  it("displays the back to job hunt button", async () => {
    await renderNotFound();
    expect(screen.getByText("Back to Job Hunt")).toBeInTheDocument();
  });

  it("navigates to home when button is clicked", async () => {
    const router = await createTestRouter();
    render(NotFound, { global: { plugins: [router] } });

    await fireEvent.click(screen.getByText("Back to Job Hunt"));

    await waitFor(() => {
      expect(router.currentRoute.value.name).toBe("Home");
    });
  });

  it("displays the current path in the code block", async () => {
    const router = await createTestRouter("/nonexistent");
    await router.isReady();

    render(NotFound, { global: { plugins: [router] } });

    expect(screen.getByText(/\/nonexistent/)).toBeInTheDocument();
  });
});
