import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";

import { TYPES } from "./configuration";
import { MessageService } from "./features/message/services";
import { LoggerUtils } from "./utils";

@injectable()
export class Bot {
    private client: Client;
    private readonly token: string;

    private messageService: MessageService;
    private loggerUtils: LoggerUtils;

    constructor(
        @inject(TYPES.Client) client: Client,
        @inject(TYPES.MessageService) messageService: MessageService,
        @inject(TYPES.LoggerUtils) loggerUtils: LoggerUtils,
    ) {
        this.client = client;
        this.token = require("../config").discord.token;

        this.messageService = messageService;
        this.loggerUtils = loggerUtils;
    }

    /**
     * Log le bot sur le serv
     */
    login(): void {
        console.log("Bot starting...");
        this.client.login(this.token);
        console.log("Connection OK");
    }

    /**
     * Démarrage du bot
     */
    start(): void {
        console.log("Bot started !\n");

        // écoute message
        this.client.on("messageCreate", (message: Message) => {
            // reaction au message
            this.loggerUtils.logMessage(message);
            this.messageService.onMessage(message);
        });
    }
}
