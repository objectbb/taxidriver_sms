var request = require('request');
var twilio = require('twilio');
var mongoose = require('mongoose');
var express = require('express');
var app = express();

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
	limit: 2500, //day
	url: "https://maps.googleapis.com/maps/api/geocode/json?address={{ADDRESS}}&key={{TOKEN}}",
	token: "AIzaSyBqK4f8zbMrK4K5cxWb8_10Zkbk7LHMrKE",
	requesturl: function(url, address, token) {
		return url.replace("{{ADDRESS}}", address).replace("{{TOKEN}}", token);
	},
	response: function(body) {
		if (body.results != undefined && body.results[0] != undefined && body.results[0].geometry != undefined && body.results[0].geometry.location != undefined) {
			var loc = body.results[0].geometry.location;
			var addr = changeCase.upper(body.results[0].formatted_address);
			var cmpnts = body.results[0].address_components;
			var shortaddr = cmpnts[0]["short_name"] + " " + changeCase.upper(cmpnts[1]["short_name"]) + "," + cmpnts[2]["short_name"];

			return {
				loc: loc,
				fulladdress: addr
			};
		}

		return null;
	}
};

app.get('/', function(request, response) {

	//recieve address
	var address = request.body;

	//geoloc address
	
	var gourl = geocodeer.requesturl(geocodeer.url, address, geocodeer.token);

	console.log(address);
	response.send("Computing...");
	request(gourl, function(err, res, body) {
		if (err) {
			JSON.stringify(err);
			return done(err);
		}
		if (res.statusCode != 200) return done(res.statusCode);
		done();
		var location = geocodeer.response(body);

		/*
		if (!location)
			response.send("Submitted Address Failed");
		//return violations
		var rs = nearviolations.find({
			loc: {
				'$near': [location.lng, location.lat]
			}
		}).limit(5);
		//return no violations

		client.messages.create({
			to: '+17739809873',
			from: '+17736090911',
			body: JSON.stringify(rs)
		}, function(error, message) {
			if (error) {
				response.send(error.message);
			}
		});
		*/

	});

	response.send("made it this far");
});

app.listen(app.get('port'), function() {
	console.log("Node app is running on port:" + app.get('port'))
})