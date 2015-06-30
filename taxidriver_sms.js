var accountSid = 'AC0cabfe79a2b5b8273320781fca4c09ed';
var authToken = "985d9014c96813f6110cde04b83bb8bb";
var twilio = require('twilio');
var mongoose = require('mongoose');
var express = require('express');
var app = express();
var client = new twilio.RestClient(accountSid, authToken);

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {

	client.messages.create({
		to: '+17739809873',
		from: '+17736090911',
		body: 'Hello World'
	}, function(error, message) {
		if (error) {
			console.log(error.message);
		}
	});
});

app.listen(app.get('port'), function() {
	console.log("Node app is running on port:" + app.get('port'))
})