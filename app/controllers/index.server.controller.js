exports.render = function(req, res) {
	res.render('index', {
		title: 'HC大会IoT开发者展区',
		user: JSON.stringify(req.user)
	});
};