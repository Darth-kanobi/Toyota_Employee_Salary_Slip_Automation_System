import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "salary-slips/uploads",
        public_id: `${Date.now()}-${filename}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const { Readable } = require("stream");
    const readable = Readable.from(buffer);
    readable.pipe(stream);
  });
}

export default cloudinary;
