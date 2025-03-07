import { Queue } from "bullmq";
export  const createQueue=(queueName)=>{
  return new Queue(queueName,{
    redis: {
      host: "127.0.0.1",
      port: 6379,
    },
    defaultJobOptions: {
      attempts: 2,
      backoff: {type:'fixed',delay:5000},
      removeOnComplete:true,
      removeOnFail: { age: 86400, count: 500 } 
    },
  })
}
