import express, { Express } from "express";
import routes from "../routes";

export function createServer() {
  const app: Express = express();
  app.use(express.json());

  routes(app);

  return app;
}

export default createServer;