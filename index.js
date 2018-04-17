const teams = require("./memberList.js");
const Botkit = require("botkit");
const CronJob = require("cron").CronJob;
const Redis = require("redis")
const controller = Botkit.slackbot();
const client = Redis.createClient();
require("bluebird").promisifyAll(Redis.RedisClient.prototype);

const bot = controller.spawn({
  token: process.env.NICCHOKU_KUN_SLACK_TOKEN
}).startRTM(function(err, bot, payload) {
  if (err) {
    throw new Error("Could not connect to Slack");
  }
  new CronJob({
    cronTime: "00 55 23 * * *",
    onTick: function() {
      getNicchokuCalled().then(function(result){
        if (result === "true") {
          client.set("nicchoku_index", getTomorrowIndex);
          client.set("nicchoku_called", "false");
        }
      });
    },
    start: true,
    timeZone: "Asia/Tokyo"
  });
});

// 動作確認
controller.hears(["ping"], ["direct_message", "direct_mention", "mention"], function(bot, message) {
  getNicchokuCalled().then(function(result){
    console.log(result)
  });
  bot.reply(message, "PONG");
  client.set("nicchoku_called", "false")
});

controller.hears(["日直", "にっちょく"], ["direct_message", "direct_mention", "mention"], function(bot, message) {
  getNicchokuIndex().then(function(result){
    let index = Number(result)
    let tomorrowIndex = getTomorrowIndex(index)
    bot.reply(message, "<!here> 本日の日直は" + teams.allMember[index] + "です！ ちなみに次の日直は" + teams.allMember[tomorrowIndex] + "です");
    client.set("nicchoku_called", "true")
  });
});

function getTomorrowIndex(index) {
  if (index >= (teams.allMember.length - 1)) {
    return 0;
  } else {
    return index + 1
  }
};

function getNicchokuIndex() {
  let promise = client.getAsync("nicchoku_index").then(function(reply) { return reply; })
  return Promise.resolve(promise)
}

function getNicchokuCalled() {
  let promise = client.getAsync("nicchoku_called").then(function(reply) { return reply; })
  return Promise.resolve(promise)
}
