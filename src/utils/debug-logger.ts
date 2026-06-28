import { appendFile } from "fs/promises";
import appConfig from "../config";

export const debugLogger = (file: string, content: any) => {
  if (!appConfig.enableLogs) {
    return;
  }

  appendFile(
    `.logs/${file}.log`,
    `\n===== ${new Date().toISOString()} =====\n${JSON.stringify(content, null, 2)}\n`,
  );
};
