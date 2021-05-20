const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    accessKeyId: 'rA7rSDtopds7n/NQ21GP6g==',
    secretAccessKey: 'c2iI2GVW719sYximecBU5366yliNERM0uI5Om4UzJnk=',
    endpoint: 'https://storageapi.fleek.co',
    region: 'us-east-1',
    s3ForcePathStyle: true
 });

 s3.listBuckets(function (err, data) {
    if (err) {
      console.log("Error when listing buckets", err);
    } else {
      console.log("Success when listing buckets", data);
    }
 });

 const params = {
    Bucket: "my-bucket",
    MaxKeys: 20
 };
s3.listObjectsV2(params, function (err, data) {
    if (err) {
       console.log("Error when listing objects", err);
    } else {
       console.log("Success when listing objects", data);
    }
});

