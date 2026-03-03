require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const pool = require("./db");

const swaggerUi = require("swagger-ui-express");
const { buildSwaggerSpec } = require("./swagger");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const biddingRoutes = require("./routes/bidding.routes");
const publicRoutes = require("./routes/public.routes");
const clientTokenRoutes = require("./routes/clientTokens.routes");

const app = express();

app.use(helmet());
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

app.use(express.json());

const sessionStore = new MySQLStore({}, pool);

app.use(
  session({
    name: "phantasmagoria.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true in production with https
      maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bidding", biddingRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin/client-tokens", clientTokenRoutes);

const spec = buildSwaggerSpec();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));

module.exports = app;