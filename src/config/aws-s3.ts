import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '@/env'

const s3 = new S3Client({
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  region: env.AWS_REGION,
})

interface saveImageToS3Props {
  fileName: string
  arrayBuffer: ArrayBuffer
  imgType: string
}

export async function saveImageToS3({
  fileName,
  arrayBuffer,
  imgType,
}: saveImageToS3Props) {
  const params = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(arrayBuffer),
    ContentType: imgType,
  })

  await s3.send(params)
}

interface deleteImageToS3Props {
  imageKey: string
}

export async function deleteImageToS3({
  imageKey
}: deleteImageToS3Props) {
  const params = new DeleteObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: imageKey
  })

  await s3.send(params)
}
