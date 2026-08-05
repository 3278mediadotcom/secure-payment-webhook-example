type LogLevel = "debug" | "info" | "warn" | "error";


class Logger {
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  }


  debug(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV === "development") {
      console.log(this.formatMessage("debug", message), ...args);
    }
  }


  info(message: string, ...args: unknown[]): void {
    console.log(this.formatMessage("info", message), ...args);
  }


  warn(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage("warn", message), ...args);
  }


  error(message: string, ...args: unknown[]): void {
    console.error(this.formatMessage("error", message), ...args);
  }
}


export const logger = new Logger();