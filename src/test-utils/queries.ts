// /src/test-utils/queries.ts

import { screen } from "@testing-library/vue";

/* ----------------------------------------
 * Inputs
 * ------------------------------------- */

export async function getInput<T extends HTMLElement>(
  name: string | RegExp,
): Promise<T> {
  return (await screen.findByLabelText(name)) as T;
}

/* ----------------------------------------
 * Buttons
 * ------------------------------------- */

export async function getButtonByName(name: string | RegExp) {
  return await screen.findByRole("button", { name });
}

export async function getIconButton(name: string | RegExp) {
  return getButtonByName(name);
}
