var express = require('express');
var router = express.Router();
var ical = require("ical");
var _ = require("underscore");
var moment = require("moment-timezone");

var calId = "d9k4hvrst8levce2qb4ojtqm7c";
var timezone = "Asia/Bangkok";
var hash = require('hashtags');

var ironcache = require('iron-cache');
var client = ironcache.createClient({project:process.env.IRON_CACHE_PROJECT_ID, token:process.env.IRON_CACHE_TOKEN});
client.put('my-cache', 'test',{value:'foo'}, function(err, res) {
  if (err) throw err;
  console.log(res);
});

function parseDescription(str) {
  var tags = hash(str) || [];
  
  _.each(tags, function(tag) {
    str = str.replace(tag, "");
  })
  
  tags = _.map(tags, function(tag) {
    return tag.substr(1);
  });
  
  return {description:str, tags:tags};
}

function parseEventsHash(hash) {
  var events = _.values(hash);
  events = _.map(events, function(e) {
    
    var descandtags = parseDescription(e.description);
    console.log(descandtags);
    return _.extend(e, {
      time: new moment(e.start).tz(timezone),
      description:descandtags.description,
      tags:descandtags.tags,
      allday: new moment(e.end).diff(new moment(e.start))>80000000
    });
  })
  return events
}

/* GET home page. */
router.get('/', function(req, res, next) {
  ical.fromURL("https://calendar.google.com/calendar/ical/"+calId+"%40group.calendar.google.com/public/basic.ics",{},function(err, events) {
    if (err) { return console.log(err.message); }
    // events is now array of all calendar events
    res.render("index",{events:parseEventsHash(events)});
  });
});

module.exports = router;
/*
{
  "dtuujoskd97jkqjvk21dh7g9a8@google.com": {
    "type": "VEVENT",
    "params": [],
    "start": "2016-11-30T17:00:00.000Z",
    "end": "2016-12-01T17:00:00.000Z",
    "dtstamp": "20161031T143450Z",
    "uid": "dtuujoskd97jkqjvk21dh7g9a8@google.com",
    "created": "20161031T132806Z",
    "description": "",
    "last-modified": "20161031T132806Z",
    "location": "",
    "sequence": "0",
    "status": "CONFIRMED",
    "summary": "All day event",
    "transparency": "TRANSPARENT"
  },
  "eog0k8qgbjia3rt0vbn4abpsj4@google.com": {
    "type": "VEVENT",
    "params": [],
    "start": "2016-11-29T04:00:00.000Z",
    "end": "2016-11-29T05:00:00.000Z",
    "dtstamp": "20161031T143450Z",
    "uid": "eog0k8qgbjia3rt0vbn4abpsj4@google.com",
    "created": "20161031T132757Z",
    "description": "",
    "last-modified": "20161031T132758Z",
    "location": "",
    "sequence": "0",
    "status": "CONFIRMED",
    "summary": "Test event",
    "transparency": "OPAQUE"
  }
}
*/