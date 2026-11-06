const createMemo = (fn) => fn;

export function useLookup() {
  const memo = createMemo((a, b) => a + b);
  const value = memo("x", "y");
  return value;
}
