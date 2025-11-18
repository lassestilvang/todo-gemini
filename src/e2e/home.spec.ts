// src/e2e/home.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display a list of tasks", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Inbox")).toBeVisible();
    // Add more assertions to check for tasks
  });

  test("should be able to add a new task", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Add Task" }).click();
    await page.getByLabel("Name").fill("New integration test task");
    await page.getByRole("button", { name: "Save Task" }).click();
    await expect(page.getByText("New integration test task")).toBeVisible();
  });

  test("should be able to complete a task", async ({ page }) => {
    await page.goto("/");
    // Assuming there's a task to complete
    await page.getByRole("checkbox").first().check();
    await expect(page.getByText("Test Task").first()).toHaveClass(/line-through/);
  });

  // Add more tests for:
  // - Navigation to other views (Today, Next 7 Days, Upcoming, All)
  // - Adding a new list
  // - Checking overdue tasks highlighting
  // - Interacting with sub-tasks
  // - Opening task history
  // - Performing fuzzy search
});
