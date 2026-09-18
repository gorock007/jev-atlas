import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function ensureParent(path: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
}

export async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

export async function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  await ensureParent(path);
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, path);
}

export async function appendJsonLines(path: string, values: unknown[]): Promise<void> {
  if (values.length === 0) return;
  await ensureParent(path);
  await appendFile(path, `${values.map((value) => JSON.stringify(value)).join("\n")}\n`, "utf8");
}

export async function readJsonLines<T>(path: string): Promise<T[]> {
  let contents: string;
  try {
    contents = await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  return contents
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line) as T;
      } catch {
        throw new Error(`Malformed JSONL at ${path}:${index + 1}`);
      }
    });
}

export async function replaceJsonLines(path: string, values: unknown[]): Promise<void> {
  await ensureParent(path);
  const temporary = `${path}.${process.pid}.tmp`;
  const contents = values.length === 0 ? "" : `${values.map((value) => JSON.stringify(value)).join("\n")}\n`;
  await writeFile(temporary, contents, "utf8");
  await rename(temporary, path);
}

export async function writeTextAtomic(path: string, contents: string): Promise<void> {
  await ensureParent(path);
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, contents.endsWith("\n") ? contents : `${contents}\n`, "utf8");
  await rename(temporary, path);
}
