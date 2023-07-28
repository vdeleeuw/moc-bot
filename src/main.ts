import { Bot } from "./bot";
import cont from "./configuration/inversify";
import { TYPES } from "./configuration";

// lancement du bot
const bot = cont.get<Bot>(TYPES.Bot);
bot.login();
bot.start();
