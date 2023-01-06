import * as AWS from 'aws-sdk';

// const credentials = new AWS.Credentials()
var credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.credentials = credentials;
AWS.config.update({ region: process.env.AWS_REGION });


const s3 = new AWS.S3();
export const uploadFile = async (file: any) => {
  try {
    let filename = file.originalname.split('.')[0];
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${filename}.jpg`,
      Body: file.buffer,
    };

    try {
      const data = await s3.upload(params).promise();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log('Error in File Upload: ', error);
      return {
        success: false,
        error: error.message,
      };
    }
  } catch (error) {
    console.log('Error in File Upload Outer: ', error);

    return {
      success: false,
      error: error.message,
    };
  }
};
