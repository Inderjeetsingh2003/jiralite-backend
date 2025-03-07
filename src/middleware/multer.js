//import multer from "multer";
import path, { dirname } from "path";
import multer from "koa-multer";
import { fileURLToPath, pathToFileURL } from "url";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const tempdir = path.join(__dirname, "../public/temp");

    cb(null, tempdir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
