'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var ObjectId = require('mongoose').Types.ObjectId;
var Pin = require('../models/pins.js');
var User = require('../models/users.js');

module.exports = function(app, passport) {

	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		else {
			res.redirect('/');
		}
	}

	var clickHandler = new ClickHandler();

	app.route('/')
		.get(function(req, res) {
			Pin.find({}).sort('-date').exec(function(err, pins) {
				if (err) {
					res.render('err');
				}
				else {
					console.log("Passing books to ejs", pins.length);
					res.render('index', {
						user: req.user,
						pins: pins
					});
				}
			});
		});

	app.route('/')
		.post(isLoggedIn, function(req, res) {
			console.log("Inside addPin route");
			//console.log("Params", req.body);
			var pin = new Pin();
			pin.userId = req.user._id;
			pin.title = req.body.title;
			pin.pinUrl = req.body.pinUrl;
			pin.userName = req.user.github.username;
			pin.createdDate = new Date();
			pin.save(function(err) {
				if (err) {
					res.render('error');
				}
				else {
					res.redirect('/myPins');
				}
			});
		});
	app.route('/logout')
		.get(function(req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/addPin')
		.get(isLoggedIn, function(req, res) {
			res.render('addPin', {
				user: req.user
			});
		});

	app.route('/myPins')
		.get(isLoggedIn, function(req, res) {
			Pin.find({
				userId: req.user._id
			}, function(err, pins) {
				if (err) {
					res.render('err');
				}
				else {
					console.log("Passing pins to ejs", pins.length);
					res.render('myPins', {
						user: req.user,
						pins: pins
					});
				}
			});
		});

	app.route('/api/:id')
		.get(isLoggedIn, function(req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
