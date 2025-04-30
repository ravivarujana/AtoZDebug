import { v2 as cloudinary } from "cloudinary";
import stream from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadBufferToCloudinary(buffer, filename = "screenshot") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "inspirations",
        public_id: filename,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.Readable.from(buffer).pipe(uploadStream);
  });
}

export { uploadBufferToCloudinary };
