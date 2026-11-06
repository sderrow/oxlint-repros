import { useEffect } from "react";

const OUTER = 1;

export function D({ section, page }) {
  useEffect(() => {
    console.log(section, page, OUTER);
  }, [
    section, // re-run when the tab changes
    page,
    OUTER,
  ]);
  return null;
}
