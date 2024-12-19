import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import applicantRoutes from "./routes/applicantRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import cors from "cors";

dotenv.config();

const app = express();

const allowedOrigins = ["http://localhost:5173"];

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or server-to-server requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // Allow cookies or credentials
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/applicant", applicantRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/job", jobRoutes);


app.get("/", (request, response) => {
  console.log("Server is Runnning");
  return response.status(200).send({ meesage: "hello world!" });
});

app.use(notFound);
app.use(errorHandler);

export default app;
