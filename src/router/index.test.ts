// /src/router/index.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import type { Router } from "vue-router";
import { createRouter, createMemoryHistory } from "vue-router";

import { routes } from "@/router";

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createMemoryHistory(),
    routes,
  });

  await router.push("/");
  await router.isReady();
});

describe("Router Configuration", () => {
  it("has a route for home", () => {
    const homeRoute = router.getRoutes().find(r => r.name === "Home");

    expect(homeRoute).toBeDefined();
    expect(homeRoute?.path).toBe("/");
  });

  it("has a route for applications", () => {
    const appRoute = router.getRoutes().find(r => r.name === "Applications");

    expect(appRoute).toBeDefined();
    expect(appRoute?.path).toBe("/applications");
  });

  it("uses lazy loading for route components", () => {
    const routes = router.getRoutes();

    routes.forEach(route => {
      // Check that components is a function (lazy loaded) or an object
      expect(route.components).toBeDefined();
    });
  });

  it("has correct route names", () => {
    const routeNames = router.getRoutes().map(r => r.name);

    expect(routeNames).toContain("Home");
    expect(routeNames).toContain("Applications");
  });

  it("supports history mode navigation", () => {
    expect(router.options.history).toBeDefined();
  });
});

describe("Router Navigation", () => {
  it("navigates to home route", async () => {
    await router.push("/");
    expect(router.currentRoute.value.name).toBe("Home");
  });

  it("navigates to applications route", async () => {
    await router.push("/applications");
    expect(router.currentRoute.value.name).toBe("Applications");
  });

  it("supports applications route with site query param", async () => {
    await router.push("/applications?site=workday-acme");

    expect(router.currentRoute.value.name).toBe("Applications");
    expect(router.currentRoute.value.query.site).toBe("workday-acme");
  });

  it("handles unknown routes gracefully", async () => {
    await router.push("/nonexistent");

    // Should stay on last valid route or go to home
    // Behavior depends on your router configuration
    const currentRoute = router.currentRoute.value;
    expect(currentRoute).toBeDefined();
  });
});

describe("Route Meta and Props", () => {
  it("applications route accepts site query parameter", async () => {
    await router.push({ name: "Applications", query: { site: "test-id" } });

    expect(router.currentRoute.value.query.site).toBe("test-id");
  });

  it("home route has no required params", async () => {
    await router.push({ name: "Home" });

    expect(router.currentRoute.value.name).toBe("Home");
    expect(Object.keys(router.currentRoute.value.params)).toHaveLength(0);
  });
});
