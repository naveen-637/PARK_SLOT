import cloudinaryModule from 'cloudinary';

const { v2: cloudinary } = cloudinaryModule;

const cloudinaryEnabled = () => {
  return Boolean(
    process.env.CLOUDINARY_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_NAME !== 'placeholder'
  );
};

if (cloudinaryEnabled()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

export const uploadBufferToCloudinary = async (buffer, folder = 'parking-slot') => {
  if (!cloudinaryEnabled()) {
    return {
      secure_url: `https://dummyimage.com/1200x800/cccccc/222222.jpg&text=${encodeURIComponent(folder)}`
    };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};
