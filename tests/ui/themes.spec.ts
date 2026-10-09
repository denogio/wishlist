import { expect, test } from "@playwright/test";
import { adminAuthFile } from "../constants";

const themes = ["catppuccin-mocha", "tokyo-night", "everforest", "gruvbox", "rose-pine"];

test("custom themes persist and restore the default light preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/login");
    const picker = page.locator("#theme-picker");
    for (const theme of themes) {
        await picker.selectOption(theme);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
    }
    await page.reload();
    await expect(picker).toHaveValue("rose-pine");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
    await picker.selectOption("wishlist");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
});

test("system color changes never override a dark-only theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/login");
    await page.locator("#theme-picker").selectOption("gruvbox");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.emulateMedia({ colorScheme: "light" });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
});

test("invalid saved theme falls back without browser errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => localStorage.setItem("theme", "not-json"));
    await page.goto("/login");
    await expect(page.locator("#theme-picker")).toHaveValue("wishlist");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "wishlist");
    expect(errors).toEqual([]);
});

test("unknown saved theme uses the default theme", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", JSON.stringify("unknown-theme")));
    await page.goto("/login");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "wishlist");
    await expect(page.locator("#theme-picker")).toHaveValue("wishlist");
});

test.describe("signed in", () => {
    test.use({ storageState: adminAuthFile });

    test("saved theme applies before opening the user menu", async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem("theme", JSON.stringify("gruvbox")));
        await page.goto("/lists");
        await expect(page.locator("html")).toHaveAttribute("data-theme", "gruvbox");
        await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
    });
});
