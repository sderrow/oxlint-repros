import { useEffect, useRef } from "react";

const OUTER = 1;
const OTHER = 2;

export function C({ section }) {
  const ref = useRef(null);
  const other = useRef(null);
  useEffect(() => {
    if (section === "a") ref.current?.scrollIntoView();
  }, [section, ref.current, other.current, OUTER, OTHER]);
  return <div ref={ref} />;
}
