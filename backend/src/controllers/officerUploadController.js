import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, "../../uploads/evidence");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadEvidence(req, res) {
  try {
    const { file_name, mime_type, file_data_base64, evidence_type = "AFTER" } = req.body;

    if (!file_data_base64) {
      return res.status(400).json({
        success: false,
        message: "No file data provided."
      });
    }

    // MIME type check
    const detectedMime = mime_type || "image/jpeg";
    if (!ALLOWED_MIME_TYPES.includes(detectedMime.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Unsupported file type: ${detectedMime}. Allowed formats: JPG, PNG, WEBP, PDF.`
      });
    }

    // Extract base64 buffer
    const base64Data = file_data_base64.replace(/^data:([A-Za-z-+/]+);base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Size validation
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds configured limit of 10MB (Received: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`
      });
    }

    // Generate safe, collision-resistant unique filename
    const ext = detectedMime === "image/png" ? ".png" : detectedMime === "image/webp" ? ".webp" : detectedMime === "application/pdf" ? ".pdf" : ".jpg";
    const uniqueHash = crypto.randomBytes(16).toString("hex");
    const safeFilename = `evidence_${Date.now()}_${uniqueHash}${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeFilename);

    // Save to disk
    fs.writeFileSync(filePath, buffer);

    // Return reference URL (or local storage key)
    const storageKey = `/uploads/evidence/${safeFilename}`;

    return res.status(201).json({
      success: true,
      message: "Evidence file uploaded successfully.",
      data: {
        file_name: file_name || safeFilename,
        storage_key: storageKey,
        mime_type: detectedMime,
        file_size: buffer.length,
        evidence_type: evidence_type.toUpperCase(),
        uploaded_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Upload evidence error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
