// Fixtures live outside the repo because oxlint skips gitignored directories.
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const fixtures = join(tmpdir(), "oxlint-js-plugin-fixtures");
const COUNT = 2000;

const component = (f, c) => `
type Props${c} = { id: string; label: string; items: Array<{ key: string; value: number }>; onSelect?: (key: string) => void };

export const Widget${f}_${c} = ({ id, label, items, onSelect }: Props${c}): JSX.Element => {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const visible = useMemo(() => items.filter((i) => i.key.includes(filter) && i.value > ${c}), [items, filter]);
  const total = useMemo(() => visible.reduce((sum, i) => sum + i.value * ${c + 1}, 0), [visible]);
  useEffect(() => {
    if (selected && onSelect) onSelect(selected);
  }, [selected, onSelect]);
  const handleClick = useCallback((key: string) => () => setSelected(key === selected ? null : key), [selected]);
  return (
    <section id={id} className="widget-${c}" data-total={total}>
      <header>
        <h2>{label} #{${c}}</h2>
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter ${f}" />
      </header>
      <ul>
        {visible.map((item) => (
          <li key={item.key} onClick={handleClick(item.key)} className={item.key === selected ? "active" : undefined}>
            <span>{item.key}</span> <strong>{item.value.toFixed(2)}</strong>
          </li>
        ))}
      </ul>
      {total > ${c * 10} ? <footer>Total: {total}</footer> : null}
    </section>
  );
};
`;

const large = (f) => {
  let out = `import { useCallback, useEffect, useMemo, useState } from "react";\n`;
  for (let c = 0; out.length < 43_000; c++) out += component(f, c);
  return out;
};

export const generateFixtures = () => {
  rmSync(fixtures, { recursive: true, force: true });
  mkdirSync(join(fixtures, "small"), { recursive: true });
  mkdirSync(join(fixtures, "large"), { recursive: true });
  for (let f = 0; f < COUNT; f++) {
    writeFileSync(join(fixtures, "small", `f${f}.ts`), `export const v${f} = ${f};\n`);
    writeFileSync(join(fixtures, "large", `f${f}.tsx`), large(f));
  }
};

export const ensureFixtures = () => {
  if (!existsSync(join(fixtures, "large"))) generateFixtures();
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateFixtures();
  console.log(`Wrote fixtures to ${fixtures}`);
}
