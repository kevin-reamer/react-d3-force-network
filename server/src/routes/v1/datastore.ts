import { Datastore } from "@google-cloud/datastore";
import express, { Request, Response } from "express";

import { getNodes, getNodesBySearch, upload } from "../../controllers/datastore.controller";

const router = express.Router();

// Your Google Cloud Platform project ID
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Creates a client
const datastore = new Datastore({
  projectId,
  keyFilename
});

router.post("/v1/upload", (req: Request, res: Response) => {
  const data = req.body.data;
  upload(data, datastore)
    .then((results: any) => {
      res.send(results);
    })
    .catch(console.error);
});

router.get("/v1/getNodes", (req: Request, res: Response) => {
  getNodes(datastore)
    .then((results: any) => {
      res.send(results);
    })
    .catch(console.error);
});

router.get("/v1/getNodesBySearch", (req: Request, res: Response) => {
  const search = req.query.search;
  getNodesBySearch(search, datastore)
    .then((results: any) => {
      res.send(results);
    })
    .catch(console.error);
});

export default router;
