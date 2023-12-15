const { S3Client } = require("@aws-sdk/client-s3");
const { createImageData } = require("../../services/Image");
const fs = require("fs");

const bucketName = process.env.BUCKET_NAME;
const buckeRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccesskey = process.env.SECRET_ACCESS_KEY;

const imageProcessing = () => {
  try {
    //imagePath value should be the path of image
    //below is the temporary path which needs to be changed after cron implementation
    const imagePath = "./images";
    fs.readdir(imagePath, (err, files) => {
      if (err) {
        return {
          message: "something went wrong!",
          statusCode: 401,
          error: err,
        };
      } else {
        files.forEach(async (image) => {
          const isImageDataCreated = await createImageData(image);
          if (isImageDataCreated) {
            const s3 = new S3Client({
              credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretAccesskey,
              },
              region: buckeRegion,
            });
            //imagePath value should be the path of image
            //below is the temporary path which needs to be changed after cron implementation
            const imagePath = `./images/${image}`;
            const params = {
              Bucket: bucketName,
              Key: file,
              Body: fs.readFileSync(imagePath),
            };
            const command = new PutObjectCommand(params);
            await s3.send(command);
            return {
              message: "Data Inserted in db",
              statusCode: 201,
              error: "OK",
            };
          }
          return {
            message: "Data already present in db",
            statusCode: 409,
            error: "Conflict",
          };
        });
      }
    });
  } catch (error) {
    return {
      message: error,
      statusCode: 500,
      error: "Internal Server error",
    };
  }
};


