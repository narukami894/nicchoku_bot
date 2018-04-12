const teams = require("./memberList.js");
let isNicchokuCalled = false;

const Botkit = require("botkit");
const CronJob = require("cron").CronJob;
const controller = Botkit.slackbot();
const bot = controller.spawn({
  token: process.env.NICCHOKU_KUN_SLACK_TOKEN
}).startRTM(function(err, bot, payload) {
  if (err) {
    throw new Error("Could not connect to Slack");
  }
  new CronJob({
    cronTime: "00 55 23 * * *",
    onTick: function() {
      if (isNicchokuCalled) {
        nicchoku = teams.allMember[0];
        teams.allMember.push(nicchoku);
        teams.allMember.shift();
        isCalled = false;
      }
    },
    start: true,
    timeZone: "Asia/Tokyo"
  });
});

// 動作確認
controller.hears(["ping"], ["direct_message", "direct_mention", "mention"], function(bot, message) {
  bot.reply(message, "PONG");
});

controller.hears(["日直", "にっちょく"], ["direct_message", "direct_mention", "mention"], function(bot, message) {
  bot.reply(message, "<!here> 本日の日直は" + teams.allMember[0] + "です！ ちなみに明日の日直は" + teams.allMember[1] + "です");
  isNicchokuCalled = true;
});
