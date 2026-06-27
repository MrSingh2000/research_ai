import { readFile } from "fs/promises";
import path from "path";

export const loadSkill = async (name: string): Promise<string> => {
  return readFile(
    path.join(process.cwd(), "src/skills", `${name}.md`),
    "utf-8",
  );
};
