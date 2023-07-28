import { Message } from "discord.js";
import { injectable, inject } from "inversify";
import { MessageUtils } from ".";
import { TYPES } from "../configuration";

@injectable()
export class LoggerUtils {
    private messageUtils: MessageUtils;

    constructor(@inject(TYPES.MessageUtils) messageUtils: MessageUtils) {
        this.messageUtils = messageUtils;
    }

    /**
     * Log un message
     *
     * @param {*} message le message
     */
    logMessage(message: Message): void {
        if (!this.messageUtils.isPrivateMessage(message)) {
            console.log(`Message from ${message?.author?.username} (${message?.author?.tag}) : ${message.content}`);
        }
    }

    /**
     * Log un appel d'erreur
     *
     * @param err l'erreur
     */
    logApiCallError(err: string): void {
        console.log(`Api Error : ${err}`);
    }

    /**
     * Log une erreur
     *
     * @param err l'erreur
     */
    logError(err: string): void {
        console.log(`Error : ${err}`);
    }

    /**
     * Log un message
     *
     * @param {*} message le message
     */
    logApiCall(url: string): void {
        console.log(`Api call : ${url}`);
    }
}
