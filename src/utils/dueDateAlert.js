import cron from "node-cron";
import { findTaskByDueDate } from "../database/dbQueries/Task.Query.js";
import { createQueue } from "./bullQueue.js";
const dueDateRemainderQueue = createQueue("dueDateRemainderQueue");
let result;

// async function checkJobs() {
//   const jobs = await dueDateRemainderQueue.getJobs(["waiting", "delayed"]);
//   console.log(
//     "Pending jobs:",
//     jobs.map((job) => job.data)
//   );
// }
async function alertDueDate() {
  const currentDate = new Date();
  let targetDate = new Date();
  targetDate.setDate(currentDate.getDate() + 2);
  targetDate = targetDate.toISOString().split("T")[0];
  result = await findTaskByDueDate({
    dueDate: { $lte: targetDate },
    status: "pending",
  });
  if (result && result.length > 0) {
    let i = 1;
    result.forEach((task) => {
      dueDateRemainderQueue.add("dueDateEmail", {
        email: task.email,
        taskname: task.taskname,
      });
      i = i + 1;
    });
  } else {
    console.log("no task pending with nereast due date");
  }
}
cron.schedule("30 9 * * *", async () => {
  await alertDueDate();
//   await checkJobs();
});
