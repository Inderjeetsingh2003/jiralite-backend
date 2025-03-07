import { MongoClient } from "mongodb";
import { getDbConfig } from "../config/index.js";
//import '../utils/dueDateAlert.js'
const url = getDbConfig.DB_STRING||"mongodb+srv://inderjeetsingh6005:rahulinder%401409@cluster0.nfwzc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// console.log("the url is :",url)
let dbclient = null;
(async () => {
  try {
    if (!dbclient) {
      dbclient = new MongoClient(url);
      await dbclient.connect();
      console.log("connection established");
   import("../utils/dueDateAlert.js").then(()=>{
    console.log("corn job is up and running")
   })
      return dbclient;
    }
    return dbclient;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
})();

export default dbclient;
