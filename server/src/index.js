import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose"
import auth_router from "./routes/auth.js";
import createPost_router from "./routes/createPost.js"
import cors from 'cors';
import session from 'express-session';
import connectMongoDBSession from 'connect-mongodb-session';
import uploadRouter from "./lib/uploadCloudinary.js";
import myPosts_router from "./routes/myPosts.js";
import viewPost_router from "./routes/viewPost.js";
import home_router from "./routes/home.js";  
import chatbot_router from "./routes/chatbot.js";


dotenv.config();

const MongoDBStore = connectMongoDBSession(session);


const app = express();

app.set("trust proxy", process.env.TRUST_PROXY || 1);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const mongoUri = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;
const isLocalClient = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(clientUrl);

if (!mongoUri) {
  throw new Error("MONGODB_URI is not set");
}

if (!sessionSecret) {
  throw new Error("SESSION_SECRET is not set");
}

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const store = new MongoDBStore({
  uri: mongoUri,
  collection: "sessions"
});

// Catch errors
store.on('error', function (error) {
  console.log(error);
});

app.use(session({
  secret: sessionSecret,
  proxy: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    // Cross-site cookies (Vercel -> Render) require SameSite=None + Secure.
    sameSite: isLocalClient ? "lax" : "none",
    secure: !isLocalClient,
  },
  store,
  resave: false,
  saveUninitialized: false
}));

app.use('/api/home', home_router);
app.use('/api/auth', auth_router);
app.use('/api/host', createPost_router);
app.use('/api/host', myPosts_router);
app.use('/api/host', uploadRouter);
app.use('/api', viewPost_router);
app.use('/api/chatbot', chatbot_router);

const PORT = process.env.PORT || 5000;
mongoose.connect(mongoUri)
  .then(() => {
    console.log("Connected to Mongoose");
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log("Error while connecting to Mongoose:", err);
  });
