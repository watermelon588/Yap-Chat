import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_NAME = "chat_app";

// Atlas hands you a connection string that already carries a query string:
//   mongodb+srv://user:pass@host/?retryWrites=true&w=majority&appName=Cluster0
// Concatenating "/chat_app" onto that produces a malformed URI, so slot the
// database name into the right place instead and keep the options intact.
// Works whether the env value is bare, ends in a slash, or already names a db.
export const buildUri = (raw, dbName = DB_NAME) => {
  if (!raw) throw new Error("MONGODB_URI is not set");

  const trimmed = raw.trim();
  const queryAt = trimmed.indexOf("?");
  const base = (queryAt === -1 ? trimmed : trimmed.slice(0, queryAt)).replace(/\/+$/, "");
  const query = queryAt === -1 ? "" : trimmed.slice(queryAt);

  // does the host part already have a database path on it?
  const afterScheme = base.slice(base.indexOf("://") + 3);
  const hasDb = afterScheme.includes("/");

  return hasDb ? `${base}${query}` : `${base}/${dbName}${query}`;
};

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database Connected succesfully"),
    );
    await mongoose.connect(buildUri(process.env.MONGODB_URI));
  } catch (e) {
    console.log("Error connecting to database", e);
    // a server that is up but cannot reach mongo just fails every request
    process.exit(1);
  }
};
