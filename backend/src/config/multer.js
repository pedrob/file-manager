const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

const storageTypes = {
	local: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'));
		},
		// thats function ensure that a file don't overlay another
		filename: (req, file, cb) => {
			crypto.randomBytes(16, (err, hash) => {
				if (err) cb(err);
				file.key = `${hash.toString('hex')}-${file.originalname}`;
				cb(null, file.key);
			});
		}
	}),
	s3: multerS3({
		s3: new aws.S3(),
		bucket: process.env.BUCKET_NAME,
		contentType: multerS3.AUTO_CONTENT_TYPE, // will open the file in screen
		acl: 'public-read',
		key: (req, file, cb) => {
			crypto.randomBytes(16, (err, hash) => {
				if (err) cb(err);
				const fileName = `${hash.toString('hex')}-${file.originalname}`;
				cb(null, fileName);
			});
		}
	})
};

module.exports = {
	// destination of the files
	dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
	storage: storageTypes[process.env.STORAGE_TYPE],
	// file limits
	limits: {
		fileSize: 2 * 1024 * 1024
	},
	fileFilter: (req, file, cb) => {
		const allowedMimes = [
			'image/jpeg',
			'image/pjpeg',
			'image/png',
			'image/gif'
		];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type'));
		}
	}
};
