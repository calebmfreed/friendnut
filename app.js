var port = (process.env.VCAP_APP_PORT || 8000);
var express = require("express");
var FB = require('fb');
var sentiment = require('sentiment');

var app = express();

/* Host static files */
app.configure(function(){
  app.use(express.static(__dirname + '/static'));
});

/* Request should be {access_token: 12345, friend_id: 54321} */
app.get('/sentiment', function(request, api_response) {
  var response = {};

  var access_token = request.query.access_token;
  var friend_id = request.query.friend_id;

  api_response.setHeader('Content-Type', 'application/json');

  if (!access_token) {
    response['error'] = "Request did not contain `access_token`.";
    api_response.send(JSON.stringify(response));
    return;
  }
  if (!friend_id) {
    response['error'] = "Request did not contain `friend_id`.";
    api_response.send(JSON.stringify(response));
    return;
  }

  FB.setAccessToken(access_token);

  var total_sentiment = 0.0;
  var statuses = [];

  FB.api('fql', {q: 'SELECT message FROM status WHERE uid=' + friend_id + ' LIMIT 5'}, function (res) {
    if (!res || res.error) {
      console.log(!res ? 'ERROR OCCURRED' : res.error);
      return;
    }
    statuses = res.data;

    var all_statuses = '';

    // Generate total sentiment for all statuses
    for (var i = 0; i < statuses.length; i++) {
      all_statuses += statuses[i].message += ' ';
    }
    sentiment(all_statuses, function (err, sentiment_data) {
      if (err) {
        response['error'] = "Unable to generate sentiment".
        api_response.send(JSON.stringify(response));
        return;
      }

      total_sentiment += sentiment_data.comparative;
    });

    response['sentiment'] = total_sentiment;

    api_response.send(JSON.stringify(response));
    return;
  });
});

app.listen(port);
console.log("Server listening on port " + port);