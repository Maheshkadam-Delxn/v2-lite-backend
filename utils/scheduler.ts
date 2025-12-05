import cron from "node-cron";
import Logger from "@/lib/logger";

export function scheduleTask(cronExp: string, taskName: string, callback: () => void) {
  cron.schedule(cronExp, async () => {
    try {
      Logger.info(`Running scheduled task: ${taskName}`);
      await callback();
      Logger.success(`Task completed: ${taskName}`);
    } catch (error) {
      Logger.error(`Error in scheduled task: ${taskName}`, error);
    }
  });
}