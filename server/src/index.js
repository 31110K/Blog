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


dotenv.config();

const MongoDBStore = connectMongoDBSession(session);

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const store = new MongoDBStore({
  uri: "mongodb+srv://root:root@alokyadav.oameudm.mongodb.net/BLOGGING?retryWrites=true&w=majority&appName=ALOKYADAV",
  collection: "sessions"
});

// Catch errors
store.on('error', function (error) {
  console.log(error);
});

app.use(session({
  // FIXME: Use a real secret from your .env file
  secret: 'this is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  resave: true,
  saveUninitialized: true
}));

app.use('/api/home', home_router);
app.use('/api/auth', auth_router);
app.use('/api/host', createPost_router);
app.use('/api/host', myPosts_router);
app.use('/api/host', uploadRouter);
app.use('/api', viewPost_router);

const PORT = process.env.PORT;
mongoose.connect("mongodb+srv://root:root@alokyadav.oameudm.mongodb.net/BLOGGING?retryWrites=true&w=majority&appName=ALOKYADAV")
  .then(() => {
    console.log("Connected to Mongoose");
    app.listen(PORT, () => {
      console.log(`server is running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.log("Error while connecting to Mongoose:", err);
  });