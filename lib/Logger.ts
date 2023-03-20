import { Config } from "./Config.ts";
import { logger as L } from "../deps.ts";

export class Logger {
  private static instance: L.Logger;

  private constructor() {}

  public static initialize(config: Config) {
    const fileLog = new L.handlers.FileHandler("DEBUG", {
      mode: "w",
      filename: `${config.logDir}/log-${new Date(
        "YYYY-MM-DD-HH:mm:ss",
      )}.txt}`,
    });
    // We don't want to setup the file logger in test mode
    // Otherwise it leaks
    if (!Deno.env.get("ENV_MODE")) {
      fileLog.setup();
    }
    const consoleLog = new L.handlers.ConsoleHandler("INFO");

    const handlers = Deno.env.get("ENV_MODE") === "TEST"
      ? [consoleLog]
      : [fileLog, consoleLog];

    return new L.Logger("log", "DEBUG", {
      handlers,
    });
  }

  public static get(): L.Logger {
    if (Deno.env.get("ENV_MODE") === "TEST") {
      return new L.Logger("log", "DEBUG");
    }
    if (!this.instance) {
      throw new Error("Logger not initialized");
    }
    return this.instance;
  }
}
