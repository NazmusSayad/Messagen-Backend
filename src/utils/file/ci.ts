import fs from 'fs'
import path from 'path'
import cloudinary, { UploadApiOptions } from 'cloudinary'
cloudinary.v2.config()
const { upload, destroy } = cloudinary.v2.uploader

export const tempFolder = path.join(__dirname, './.cache')
export const allowed_formats = ['png', 'jpg', 'webp', 'jpeg', 'svg']
fs.existsSync(tempFolder) || fs.mkdirSync(tempFolder, { recursive: true })

const cloudinaryOptions = {
  folder: 'messagen',
  allowed_formats,
  unique_filename: true,
  resource_type: 'image',
  transformation: [{ fetch_format: 'webp' }],
}

export const save = async (
  filePath,
  { transformation = [], ...options }: UploadApiOptions
) => {
  try {
    const data = await upload(filePath, {
      ...(cloudinaryOptions as any),
      ...options,
      transformation: [
        ...cloudinaryOptions.transformation,
        ...(transformation as any),
      ],
    })

    fs.rmSync(filePath)
    return data.secure_url ?? data.url
  } catch (err) {
    fs.rmSync(filePath, { force: true })
    throw err
  }
}

export const remove = async (url: string) => {
  if (!url) return
  const publicId = url.match(/(\w*\/\w*)\.\w*$/)[1]
  await destroy(publicId)
}
