import { Worker } from "bullmq";
import { sendMailToInform } from "./mailsender.js";

const connection = {
  host: "127.0.0.1",
  port: 6379,
};
const emailWorker = new Worker(
  "emailService",
  async (job) => {
    const message = `you have been allocated a new task for the board ${job.data.boardName} task name :${job.data.title}...! Please visit the dashboard to check out`;
    const email = job.data.email;
    await sendMailToInform(message, email);
  },
  { connection }
);

const dueDateRemainderQueueWorker = new Worker(
  "dueDateRemainderQueue",
  async (job) => {
    const email = job.data.email;
    const message = `this ${job.data?.taskname} is due within 3 days, try to complete it as soon as possible...otherwise your salary will be cut....!`;
    await sendMailToInform(message, email);
  },
  { connection }
);
