import { memo } from "react";

export const Row = memo(({ label }) => <li>{label}</li>);
