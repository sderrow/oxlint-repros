import { useEffect, useRef } from "react";

const OUTER = 1;

export function A({ section }) {
  const ref = useRef(null);
  useEffect(() => {
    if (section === "a") ref.current?.scrollIntoView();
  }, [section, ref.current]);
  return <div ref={ref} />;
}

export function B({ section }) {
  useEffect(() => {
    console.log(section, OUTER);
  }, [section, OUTER]);
  return null;
}
