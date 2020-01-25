const Post = require('../models/Post');

module.exports = {
	async store(req, res) {
		const { originalname: name, size, key, location: url = '' } = req.file;

		const post = await Post.create({
			name,
			size,
			key,
			url
		});

		res.json(post);
	},
	async index(req, res) {
		const posts = await Post.find();

		return res.json(posts);
	},
	async destroy(req, res) {
		const post = await Post.findById(req.params.id);
		await post.remove();
		return res.json({ message: 'image removed' });
	}
};
