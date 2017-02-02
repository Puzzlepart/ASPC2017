# White Rabbit, the Matrix Slackbot

"You take the blue pill, the story ends. You wake up in your bed and believe whatever you want to believe. 
You take the red pill, you stay in Wonderland, and I show you how deep the rabbit hole goes."

## Requirements, or: How to get this thing running!

1. Clone the repo (https://github.com/Puzzlepart/ASPC2017.git) , cd to the Slackbot folder
2. Set up a bot user in your Slack team (https://[slackteam].slack.com/apps/manage/custom-integrations), take note of the API token.
3. In the Slackbot-folder, create an .env-file
4. Edit your .env-file, add SLACK_TOKEN=[your_API_token], and SLACK_AUTO_RECONNECT=true
5. NPM install
6. NPM start
7. Invite your bot user to a channel and try "@bot-username hi!"

## Get runnning in the cloud!
You can use whatever cloud provider you want, we're using Heroku.
1. Create a [free Heroku account](https://signup.heroku.com/)
2. Download the [Heroku CLI toolbelt](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up)
3. From the CLI run heroku create [appname]. Your app will be created at https://appname.herokuapp.com
4. cd to the Slackbot directory
5. Edit the keepalive url in bot.js line 38-ish, replace white-rabbit with [app-name].
6. Set the git upstream to match your heroku app git repo, with
    * heroku git:remote -a [app-name]
7a. If you're still working in the cloned ASPC2017 repo and haven't created your own, you'll want to push only the Slackbot subdirectory upstream. In that case
    * cd to the ASPC2017 directory (root repo folder)
    * run git subtree push --prefix Slackbot heroku master
7b. If you've simply copied the code and are working in your own repo with the bot code on root
    * run git push heroku master


White Rabbit is created with :heart: by the people at Puzzlepart who took the red :pill: , and is based on [[Howdyai's BotKit](https://github.com/howdyai/botkit)