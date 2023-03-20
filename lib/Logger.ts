import { logger as L } from "../deps.ts";

export default class Logger {
  private static instance: L.Logger;

  private constructor() {}

  public static get(): L.Logger {
    if (!this.instance) {
      const fileLog = new L.handlers.FileHandler("DEBUG", {
        mode: "w",
        filename: "./log.txt",
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

      const logger = new L.Logger("log", "DEBUG", {
        handlers,
      });
      this.instance = logger;
    }
    return this.instance;
  }
}
