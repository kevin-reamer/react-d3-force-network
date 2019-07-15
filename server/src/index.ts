import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import datastore from "./routes/v1/datastore";

dotenv.config();

const API_PORT = process.env.PORT || 3001;
const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const ENV_CORS = process.env.ENABLE_CORS || "true";
const ENABLE_CORS = (ENV_CORS === "true");

if (ENABLE_CORS) {

  const HOST_ADDRESS = process.env.HOST_ADDRESS || "http://localhost:3000";
  const whitelist = [HOST_ADDRESS];

  const corsOptions = {
    origin: (origin: any, callback: any) => {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  };

  app.use(cors(corsOptions));
}

// append /datastore for requests to datastore
router.use("/datastore", datastore);

// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
