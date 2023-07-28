import { Client, Message } from "discord.js";
import { injectable, inject } from "inversify";

import { TYPES } from "../../../configuration";
import { MessageGenericService, MessagePoeService } from ".";

@injectable()
export class MessageService {
    private client: Client;

    private messageGenericService: MessageGenericService;
    private messagePoeService: MessagePoeService;

    constructor(
        @inject(TYPES.Client) client: Client,
        @inject(TYPES.MessageGenericService) messageGenericService: MessageGenericService,
        @inject(TYPES.MessagePoeService) messagePoeService: MessagePoeService,
    ) {
        this.client = client;
        this.messageGenericService = messageGenericService;
        this.messagePoeService = messagePoeService;
    }

    /**
     * Après un message
     *
     * @param {*} message le message
     */
    onMessage(message: Message): boolean {
        // pas de reaction aux messages du bot
        if (message?.author === this.client.user) {
            return false;
        }

        // reaction générique
        const reactionGenerique = this.messageGenericService.onMessage(message);

        // reaction poe
        const reactionPoe = this.messagePoeService.onMessage(message);

        return reactionGenerique || reactionPoe;
    }
}
