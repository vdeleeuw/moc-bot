import "reflect-metadata";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Container } from "inversify";

import { TYPES } from ".";
import { Bot } from "../bot";
import { LoggerUtils, MessageUtils, RandomUtils, DateUtils } from "../utils";
import { MessageGenericService, MessagePoeService, MessageService } from "../features/message/services";
import {
    PoeCharacterService,
    PoeApiCallService,
    PoeLeagueService,
    PoeCurrencyService,
    PoeStashService,
    PoeUserService,
    PoeItemService,
    PoeFossilService,
    PoeDivinationCardService,
    PoeEssenceService,
    PoeFragmentService,
    PoeMapService,
    PoeOilService,
    PoeScarabService,
} from "../features/poe/services";

const container = new Container();

// objets globaux
container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(
    new Client({
        intents: [
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.DirectMessageReactions,
            GatewayIntentBits.GuildEmojisAndStickers,
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent,
        ],
        partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.User],
    }),
);

// services
container.bind<LoggerUtils>(TYPES.LoggerUtils).to(LoggerUtils).inSingletonScope();
container.bind<MessageUtils>(TYPES.MessageUtils).to(MessageUtils).inSingletonScope();
container.bind<RandomUtils>(TYPES.RandomUtils).to(RandomUtils).inSingletonScope();
container.bind<DateUtils>(TYPES.DateUtils).to(DateUtils).inSingletonScope();

// messages
container.bind<MessageService>(TYPES.MessageService).to(MessageService).inSingletonScope();
container.bind<MessageGenericService>(TYPES.MessageGenericService).to(MessageGenericService).inSingletonScope();
container.bind<MessagePoeService>(TYPES.MessagePoeService).to(MessagePoeService).inSingletonScope();

// poe
container.bind<PoeCharacterService>(TYPES.PoeCharacterService).to(PoeCharacterService).inSingletonScope();
container.bind<PoeApiCallService>(TYPES.PoeApiCallService).to(PoeApiCallService).inSingletonScope();
container.bind<PoeLeagueService>(TYPES.PoeLeagueService).to(PoeLeagueService).inSingletonScope();
container.bind<PoeCurrencyService>(TYPES.PoeCurrencyService).to(PoeCurrencyService).inSingletonScope();
container.bind<PoeStashService>(TYPES.PoeStashService).to(PoeStashService).inSingletonScope();
container.bind<PoeUserService>(TYPES.PoeUserService).to(PoeUserService).inSingletonScope();
container.bind<PoeItemService>(TYPES.PoeItemService).to(PoeItemService).inSingletonScope();
container.bind<PoeFossilService>(TYPES.PoeFossilService).to(PoeFossilService).inSingletonScope();
container.bind<PoeEssenceService>(TYPES.PoeEssenceService).to(PoeEssenceService).inSingletonScope();
container.bind<PoeFragmentService>(TYPES.PoeFragmentService).to(PoeFragmentService).inSingletonScope();
container.bind<PoeMapService>(TYPES.PoeMapService).to(PoeMapService).inSingletonScope();
container.bind<PoeOilService>(TYPES.PoeOilService).to(PoeOilService).inSingletonScope();
container.bind<PoeScarabService>(TYPES.PoeScarabService).to(PoeScarabService).inSingletonScope();
container
    .bind<PoeDivinationCardService>(TYPES.PoeDivinationCardService)
    .to(PoeDivinationCardService)
    .inSingletonScope();

export default container;
