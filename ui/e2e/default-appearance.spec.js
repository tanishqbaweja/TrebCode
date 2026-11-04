import { expect,test } from "@playwright/test";

test.use({colorScheme:"dark"});

test("a fresh profile starts light on a dark OS and retains selected modes",async({page,request},testInfo)=>{
  const initial=await (await request.get("/api/state")).json();
  expect(initial.settings.appearanceMode).toBe("light");
  await page.goto("/");
  await expect(page.getByTestId("onboarding")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-mode","light");
  await page.screenshot({path:testInfo.outputPath("fresh-light-setup.png"),animations:"disabled"});
  await page.getByRole("button",{name:"Finish setup",exact:true}).click();
  await expect(page.getByTestId("composer")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-mode","light");
  await page.screenshot({path:testInfo.outputPath("fresh-light-workspace.png"),animations:"disabled"});
  await page.getByRole("navigation",{name:"Destinations"}).getByRole("button",{name:"Settings",exact:true}).click();
  await page.locator(".settings-nav").getByRole("button",{name:/^Appearance/}).click();
  await expect(page.getByRole("button",{name:"Create theme",exact:true})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath("fresh-light-settings.png"),animations:"disabled"});
  await page.getByTestId("appearance-toggle").first().click();
  await expect(page.locator("html")).toHaveAttribute("data-mode","dark");
  await page.reload();
  await expect(page.getByTestId("composer")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-mode","dark");
  await page.getByTestId("appearance-toggle").first().click();
  await expect(page.locator("html")).toHaveAttribute("data-mode","light");
  await page.reload();
  await expect(page.getByTestId("composer")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-mode","light");
});
