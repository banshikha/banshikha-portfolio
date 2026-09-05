import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// File locations
const DATA_FILE = path.join(__dirname, "data", "requests.json");
const RESUME_FILE = path.join(__dirname, "private", "Banshikha_Resume.pdf");

// Make sure data directory exists
fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

// Load resume access requests
function loadRequests() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

// Save resume access requests
function saveRequests(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Check admin key
function adminOk(req) {
  return (
    req.headers["x-admin-key"] === process.env.ADMIN_KEY &&
    !!process.env.ADMIN_KEY
  );
}

// ==========================================
// RESUME ACCESS REQUEST
// ==========================================

app.post("/api/resume-request", (req, res) => {
  const { name, email, message = "" } = req.body || {};

  if (
    !name ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({
      ok: false,
      message: "Please enter a valid name and email."
    });
  }

  const requests = loadRequests();

  const request = {
    id: crypto.randomUUID(),
    name: String(name).slice(0, 100),
    email: String(email).slice(0, 160),
    message: String(message).slice(0, 1000),
    createdAt: new Date().toISOString(),
    status: "pending"
  };

  requests.unshift(request);
  saveRequests(requests);

  res.json({
    ok: true,
    message:
      "Your request has been received. Resume access will be available after approval."
  });
});

// ==========================================
// ADMIN - VIEW REQUESTS
// ==========================================

app.get("/api/admin/requests", (req, res) => {
  if (!adminOk(req)) {
    return res.status(401).json({
      ok: false,
      message: "Unauthorized"
    });
  }

  res.json({
    ok: true,
    requests: loadRequests()
  });
});

// ==========================================
// ADMIN - APPROVE REQUEST
// ==========================================

app.post("/api/admin/approve/:id", (req, res) => {
  if (!adminOk(req)) {
    return res.status(401).json({
      ok: false,
      message: "Unauthorized"
    });
  }

  const requests = loadRequests();

  const request = requests.find(
    (r) => r.id === req.params.id
  );

  if (!request) {
    return res.status(404).json({
      ok: false,
      message: "Request not found."
    });
  }

  request.status = "approved";
  request.approvedAt = new Date().toISOString();

  // Generate secure temporary token
  const token = crypto.randomBytes(32).toString("hex");

  request.token = token;

  // Token valid for 24 hours
  request.tokenExpiresAt =
    Date.now() + 1000 * 60 * 60 * 24;

  saveRequests(requests);

  const baseUrl =
    process.env.BASE_URL ||
    `http://localhost:${PORT}`;

  res.json({
    ok: true,
    link: `${baseUrl}/resume.html?token=${token}`,
    email: request.email
  });
});

// ==========================================
// ADMIN - DENY REQUEST
// ==========================================

app.post("/api/admin/deny/:id", (req, res) => {
  if (!adminOk(req)) {
    return res.status(401).json({
      ok: false,
      message: "Unauthorized"
    });
  }

  const requests = loadRequests();

  const request = requests.find(
    (r) => r.id === req.params.id
  );

  if (!request) {
    return res.status(404).json({
      ok: false,
      message: "Request not found."
    });
  }

  request.status = "denied";

  saveRequests(requests);

  res.json({
    ok: true
  });
});

// ==========================================
// SECURE RESUME ACCESS
// ==========================================

app.get("/api/resume/:token", (req, res) => {
  const requests = loadRequests();

  const request = requests.find(
    (r) => r.token === req.params.token
  );

  // Check token
  if (
    !request ||
    request.status !== "approved" ||
    !request.tokenExpiresAt ||
    request.tokenExpiresAt < Date.now()
  ) {
    return res.status(403).send(
      "This resume access link is invalid or expired."
    );
  }

  // Check resume exists
  if (!fs.existsSync(RESUME_FILE)) {
    return res.status(404).send(
      "Resume file is not configured."
    );
  }

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    'inline; filename="Banshikha_Resume.pdf"'
  );

  res.sendFile(RESUME_FILE);
});

// ==========================================
// ADMIN PAGE
// ==========================================

app.get("/admin", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "admin.html")
  );
});

// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(
    `Portfolio running on http://localhost:${PORT}`
  );
});