import { Message } from "discord.js";
import { injectable, inject } from "inversify";

import { TYPES } from "../../../configuration";
import { MessageUtils, RandomUtils } from "../../../utils";
import { MessageEmoji } from "../constants/message-emoji.model";

@injectable()
export class MessageGenericService {
    private messageUtils: MessageUtils;
    private randomUtils: RandomUtils;

    constructor(
        @inject(TYPES.RandomUtils) randomUtils: RandomUtils,
        @inject(TYPES.MessageUtils) messageUtils: MessageUtils,
    ) {
        this.randomUtils = randomUtils;
        this.messageUtils = messageUtils;
    }

    /**
     * Après un message
     *
     * @param {*} message le message
     */
    onMessage(message: Message): boolean {
        // emojis
        const emojiReaction = this.emojiReaction(message);

        return emojiReaction;
    }

    /**
     * Réagis avec des émojis à certains messages
     *
     * @param message le message
     */
    private emojiReaction(message: Message): boolean {
        let reaction = false;

        // compliments/insultes
        if (this.randomUtils.bool(1)) {
            reaction = true;
            if (this.randomUtils.bool(50)) {
                this.messageUtils.emojiReaction(message, this.randomUtils.getOneEmojiInsulte());
            } else {
                this.messageUtils.emojiReaction(message, this.randomUtils.getOneEmojiCompliment());
            }
        }

        // mots spécifiques
        const pythonReaction = this.messageUtils.emojiReactionOnText(message, ["python"], [MessageEmoji.SERPENT]);
        reaction = reaction ?? pythonReaction;

        const selReaction = this.messageUtils.emojiReactionOnText(message, ["sel"], [MessageEmoji.SEL]);
        reaction = reaction ?? selReaction;

        return reaction;
    }
}
