import { Datastore } from "@google-cloud/datastore";
import express, { Request, Response } from "express";

import { upload } from "../../controllers/datastore.controller";

const router = express.Router();

// Your Google Cloud Platform project ID
const projectId = process.env.GCLOUD_PROJECT;
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

export default router;
