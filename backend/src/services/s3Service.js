import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import s3 from "../config/s3.js";

/**
 * Extracts S3 Key from full S3 URL or returns the key if already relative.
 * Handles virtual-hosted style URLs, path-style URLs, query parameters, and percent-encoding.
 */
export const getS3KeyFromUrl = (fileUrl) => {
  if (!fileUrl) return "";

  if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://")) {
    return decodeURIComponent(fileUrl.split("?")[0]);
  }

  try {
    const parsedUrl = new URL(fileUrl);
    let key = parsedUrl.pathname.substring(1);

    const bucketName = process.env.AWS_BUCKET_NAME;
    if (bucketName && key.startsWith(`${bucketName}/`)) {
      key = key.substring(bucketName.length + 1);
    }

    return decodeURIComponent(key);
  } catch (err) {
    return decodeURIComponent(fileUrl);
  }
};

/**
 * Uploads a file buffer to Amazon S3 bucket.
 * Returns both the object key and the legacy public S3 URL format.
 */
export const uploadFileToS3 = async (file) => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const extension = file.originalname ? file.originalname.split(".").pop() : "png";
  const fileName = `bills/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

  return {
    key: fileName,
    url: fileUrl,
  };
};

/**
 * Generates a presigned URL directly from an S3 object key.
 * Supports mode = 'preview' (inline) or 'download' (attachment with filename).
 */
export const generatePresignedUrlFromKey = async (key, options = {}) => {
  const { mode = "preview", originalFilename = null, expiresIn = 900 } = options;

  if (!key) {
    throw new Error("S3 Object Key is required to generate presigned URL.");
  }

  const commandOptions = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };

  if (mode === "download") {
    const filename = originalFilename || key.split("/").pop() || "document";
    commandOptions.ResponseContentDisposition = `attachment; filename="${filename}"`;
  }

  const command = new GetObjectCommand(commandOptions);
  const signedUrl = await getSignedUrl(s3, command, { expiresIn });
  return signedUrl;
};

/**
 * Convenience presigned URL generator supporting both S3 Keys and legacy file URLs.
 */
export const generatePresignedUrl = async (keyOrUrl, options = {}) => {
  if (!keyOrUrl) {
    throw new Error("File URL or Key is required to generate presigned URL.");
  }

  const key = getS3KeyFromUrl(keyOrUrl);
  return await generatePresignedUrlFromKey(key, options);
};