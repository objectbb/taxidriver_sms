var request = require('request');
var twilio = require('twilio');
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

var accountSid = 'AC0cabfe79a2b5b8273320781fca4c09ed';
var authToken = "985d9014c96813f6110cde04b83bb8bb";
var client = new twilio.RestClient(accountSid, authToken);

app.set('port', (process.env.PORT || 5000));

//'mongodb://taxidriver:taxidriver@host:port/database?options...'
//mongodb://taxidriver:taxidriver@ds041992.mongolab.com:41992
mongoose.connect('mongodb://taxidriver:taxidriver@ds041992.mongolab.com:41992/taxidriver');
var locSchema = mongoose.Schema({
	Address: String,
	Amount: Number,
	Description: String,
	Date: Date,
	loc: []
});
var nearviolations = mongoose.model('violations', locSchema);

var geocodeer = {
	url: "https://maps.googleapis.com/maps/api/geocode/json?address={{ADDRESS}}",
	requesturl: function(url, address, token) {
		return url.replace("{{ADDRESS}}", address);
	},
	response: function(data) {
		var loc = JSON.parse(data).results[0].geometry.location;
		return (loc) ? {
			lat: loc.lat,
			lng: loc.lng
		} : null;
	}
};

app.post('/', function(req, res) {


	var address = req.body.Body;

	console.log(address);

	//geoloc address

	var gourl = geocodeer.requesturl(geocodeer.url, address, geocodeer.token);

	request(gourl, function(err, res, body) {
		if (err) {
			JSON.stringify(err);
			return done(err);
		}

		if (res.statusCode != 200) return done(res.statusCode);

		var location = geocodeer.response(body);

		if (!location)
			res.send("Submitted Address Failed");

		console.log(JSON.stringify(location));
		//return violations
		nearviolations.find({
			loc: {
				'$near': [parseFloat(location.lng), parseFloat(location.lat)]
			}
		}).limit(5).find({}, function (err, rs) {
		  if(err) {/*error!!!*/}

		  	client.messages.create({
			to: '+17739809873',
			from: '+17736090911',
			body: (rs) ? rs : "No results"
		}, function(error, message) {
			if (error) {
				res.send(error.message);
			}
		});
		 
		});
		


	});

	res.send("made it this far");
});

app.listen(app.get('port'), function() {
	console.log("Node app is running on port:" + app.get('port'))
})