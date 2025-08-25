import app from "../backend/src/server.js";
import serverless from "serverless-http";

export default serverless(app);
