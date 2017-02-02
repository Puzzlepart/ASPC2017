//===
// White Rabbit, the Slack bot v0.1 February 2017
// Last updated 02.02.2017 by @damsleth
//===

//Check if there's a slack token, if not, we're probably debugging, so load dotenv
if (!process.env.SLACK_TOKEN) {
    require('dotenv').config();
}

//Spawn bot
var Botkit = require('botkit');
var request = require('request');
var JiraApi = require('jira-client');
var os = require('os');
var http = require('http');
var controller = Botkit.slackbot({ debug: false });
var slackToken = process.env.SLACK_TOKEN;
var bot = controller.spawn({ token: slackToken });
var helpers = require('./lib/helpers');
var fs = require('fs');
var cheerio = require('cheerio');

//Start Slack RTM
bot.startRTM(function (err, bot, payload) {
    // handle errors...
});

//Prepare the webhook
controller.setupWebserver(process.env.PORT || 3001, function (err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function () {
        // handle errors, or nah.
    });
});

//Keepalive, else the dyno will fall asleep after some minutes.
setInterval(function () {
    http.get("http://white-rabbit.herokuapp.com");
}, 300000);

//===
//bot commands
//===

//Say Hi
controller.hears(['hello', 'hey', 'hi', 'hei', 'sup', 'wassup', 'hola'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, "Hi!");
});

//Who's yo daddy?
controller.hears(["Who's yo daddy", "Who owns you", "whos your daddy", "who is your daddy", "who's your daddy"], ['direct_message', 'direct_mention', 'mention', 'ambient'], function (bot, message) {
    bot.reply(message, "Kimzter");
});

// 8 ball
controller.hears(['8ball', '8-ball', '8 ball', 'eightball', 'eight ball'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, helpers.eightBall());
});

// Jokes
controller.hears(['tell me a joke'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, helpers.getJoke());
});


//=======================
// SHAREPOINT INTEGRATION
//=====================

//Create SPSite
controller.hears(["Create-SPSite (.*)"], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var q = message.match[1];
    if (q && q.indexOf(',' > -1)) {
        var siteTitle = q.split(',')[0].toString();
        var siteDesc = q.split(',')[1].toString();
        var options = {
            headers: { 'content-type': 'application/json' },
            uri: 'https://prod-07.westeurope.logic.azure.com/workflows/09028edc18fd4db490b1c2df8cdf682d/triggers/manual/run?api-version=2015-08-01-preview&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=PiQ1nCxm1uR2_UMFlVE0zsG_AV9VXGKK07zkAcECzVY',
            method: 'POST',
            json: {
                "title": siteTitle,
                "description": siteDesc
            }
        };
        request(options, function (error, response, body) {
            if (!error) {
                console.log(response.statusCode.toString());
            }
            else {
                console.log(error.toString());
            }
            bot.reply(message, "Site "+siteTitle+ " requested! \n see https://appsters2017.sharepoint.com/sites/directory/Lists/Sites for status");
            response.end();
        });
    }
    else {
        bot.reply(message, "*Create-SPSite* \n" +
            "*Usage:* Create-SPSite [Title], [Description]");
    }
});


//========
// Jira integration
// =======

// Initialize 
var api = new JiraApi({
    protocol: process.env.JIRA_PROTOCOL,
    host: process.env.JIRA_HOST,
    username: process.env.JIRA_USER,
    password: process.env.JIRA_PASS,
    apiVersion: process.env.JIRA_API_VERSION,
    strictSSL: process.env.JIRA_STRICT_SSL
});

var __jiraConfig = {
    "issuesUrl": api.protocol + "://" + api.host + "/browse/",
    "transitions": {
        "to do": "11",
        "in progress": "21",
        "done": "31",
        "testing": "41",
        "qa": "51",
        "wontfix": "61",
        "duplicate": "71"
    }
};

//Syntax help
controller.hears(['jira help', 'man jira', 'help jira'], ['ambient', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, "*JIRA COMMANDS* \n" +
        "*Usage:* jira [Options] \n" +
        "*Create issue:* create|new <Project key>; <Issue type>; <Summary>; <Description>  _(Semi colon delimited)_ \n" +
        "*Find issue:* get|find <issue-key> \n" +
        "*Transition issue:* set|transition <issue-key> [To do|In Progress|Done|Wontfix|Impeded] \n" +
        "*Comment on issue:* comment <issue-key> <comment> \n"
    );
});

// Create issue
controller.hears(['jira new (.*)', 'jira create (.*)'], ['ambient', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var parts = message.match[1].split(";").map(function (p) { return p.trim() });
    var projectKey = parts[0], issueType = parts[1], summary = parts[2], description = parts[3];
    var addIssueJSON = {
        "fields": {
            "project": {
                "key": projectKey
            },
            "summary": summary,
            "description": description,
            "issuetype": {
                "name": issueType
            }
        }
    };
    api.addNewIssue(addIssueJSON).then(function (issue) {
        bot.reply(message, issue.key + " Created.\n" +
            __jiraConfig.issuesUrl + issue.key);
    }).catch(function (err) {
        console.log(err);
        bot.reply(message, "Sorry, couldn't create the issue for you.\n" +
            "Maybe the project key doesn't exist?\n" +
            "Check " + __jiraConfig.issuesUrl + projectKey);
    });
});

// Find issue
controller.hears(['jira get (.*)', 'jira find (.*)'], ['ambient', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var issueKey = message.match[1];
    api.findIssue(issueKey).then(function (issue) {
        bot.reply(message, issueKey +
            "\n" + issue.fields.summary +
            "\n Status: " + issue.fields.status.name +
            "\n" + __jiraConfig.issuesUrl + issueKey);
    }).catch(function (err) {
        console.log(err);
        bot.reply(message, "Sorry, couldn't find the issue for you.\n" +
            "Maybe the issue doesn't exist?\n" +
            "Check " + __jiraConfig.issuesUrl + issueKey);
    });
});


// Transition issue
controller.hears(['jira set (.*)', 'jira transition (.*)'], ['ambient', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var match = message.match[1];
    var issueKey = match.substring(0, match.indexOf(" ")).trim();
    var transitionStr = match.substring(issueKey.length + 1, match.length).trim().toLowerCase();
    var transitionId = __jiraConfig.transitions[transitionStr];
    var transitionJSON = {
        "transition": {
            "id": transitionId
        }
    };
    api.transitionIssue(issueKey, transitionJSON).then(function (issue) {
        bot.reply(message, "Issue " + issueKey + " transitioned to " + transitionStr);
    }).catch(function (err) {
        console.log(err);
        bot.reply(message, "Sorry, couldn't transition the issue for you.\n" +
            "Either it doesn't exist or the transition type is wrong.\n" +
            "Check " + api.JIRA_HOST + "/rest/api/2/issue/" + issueKey + "/transitions?expand=transitions.fields for available transitions and corresponding ids");
    });
});


//Comment on issue
controller.hears(['jira comment (.*)'], ['ambient', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var match = message.match[1];
    var issueKey = match.substring(0, match.indexOf(" ")).trim();
    var commentStr = match.substring(issueKey.length + 1, match.length).trim();
    console.log("commenting on issue " + issueKey);
    console.log("comment to be added:\n" + commentStr);
    var addCommentJSON = {
        "body": {
            "body": commentStr
        }
    };
    api.addComment(issueKey, commentStr).then(function (response) {
        bot.reply(message, "Comment added to " + issueKey + "\n" +
            __jiraConfig.issuesUrl + issueKey);
    }).catch(function (err) {
        console.log(err);
        bot.reply(message, "Sorry, couldn't add the comment for you.\n" +
            "Maybe the Issue doesn't exist?\n" +
            "Check " + __jiraConfig.issuesUrl + issueKey);
    });
});

//===========
// END JIRA INTEGRATION
//===========



//Call me "name"
controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function (err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function (err, id) {
            bot.reply(message, "Got it. I'll call you " + user.name + " from now on.");
        });
    });
});

//Return name from storage
controller.hears(['what is my name', 'who am i', 'whats my name', 'whoami'], 'direct_message,direct_mention,mention', function (bot, message) {

    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function (err, convo) {
                if (!err) {
                    convo.say('I do not know your name');
                    convo.ask('What should I call you?', function (response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function (response, convo) {
                                    //Since no further messages are queued after this,
                                    //The conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function (response, convo) {
                                    //Stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function (response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);
                        convo.next();
                    }, { 'key': 'nickname' }); //Store the results in a field called nickname

                    convo.on('end', function (convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK. I will update my database...');

                            controller.storage.users.get(message.user, function (err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function (err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });
                        } else {
                            //This happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, never mind then.');
                        }
                    });
                }
            });
        }
    });
});


//Uptime
controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function (bot, message) {
        var hostname = os.hostname();
        var uptime = helpers.formatUptime(process.uptime());
        bot.reply(message,
            "I am the White rabbit.");

    });

controller.on('slash_command', function (bot, message) {
    //Reply to slash command
    bot.replyPublic(message, 'Everyone can see the results of this slash command');
});

//Reply to personal insults
controller.hears(['fuck'], ["direct_message", "mention", "direct_mention"], function (bot, message) {
    bot.reply(message, "Hey <@" + message.user + "> \n fu:");
});


//GIPHY
controller.hears(["giphy (.*)", "gif (.*)", "(.*).gif"], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var q = message.match[1];
    if (q) { helpers.giphy(q, bot, message); }
    else { bot.reply(message, "You gotta specify a keyword for your giphy, dummy"); }
});

//Slap user
controller.hears("slap (.*)", ['ambient', 'direct_mention', 'mention'], function (bot, message) {
    var userToSlap = message.match[1];
    bot.reply(message, "*_slaps " + userToSlap + " around a bit with a big trout_*");
});

//Svada
controller.hears("Svada", ['direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, helpers.svada());
});

//Throw two Dice
controller.hears(["two dices", "craps"], ["ambient", "direct_message", "mention", "direct_mention"], function (bot, message) {
    var dice1 = Math.floor(6 * Math.random() + 1);
    var dice2 = Math.floor(6 * Math.random() + 1);
    var name = helpers.craps(dice1, dice2);
    var total = dice1 + dice2;
    bot.reply(message, "CRAPS: <@" + message.user + ">, you threw " + dice1 + " and " + dice2 + " for a total of " + total + ". " + helpers.craps(dice1, dice2).toUpperCase());
});

//Throw Dice
controller.hears("dice", "ambient", function (bot, message) {
    var dice = Math.floor(6 * Math.random()) + 1;
    bot.reply(message, "<@" + message.user + ">, you threw a " + dice);
});

//Generate guid
controller.hears(['guid', 'generate guid', 'give me a guid', 'i need a guid'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var uuid = helpers.guid();
    bot.reply(message, "I've got a fresh guid for ya, <@" + message.user + ">: " + uuid);
});

//Insult user
controller.hears('insult (.*)', ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var userToInsult = message.match[1];
    var badname = helpers.randomBadName();
    bot.reply(message, "Hey " + userToInsult + ", you" + badname + ". <@" + message.user + "> sends his regards.")
});