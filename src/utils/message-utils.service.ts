import { ChannelType, EmbedBuilder, Message, resolveColor } from "discord.js";
import { injectable } from "inversify";

@injectable()
export class MessageUtils {
    constructor() {}

    /**
     * Test si un texte est dans un message
     *
     * @param {*} message le message
     * @param {*} textes les textes à tester
     */
    contains(message: Message, textes: string[]): boolean {
        return textes.some((texte) => message.content.toLowerCase().includes(texte.toLowerCase()));
    }

    /**
     * Test si un message est un mp
     *
     * @param {*} message le message
     * @param {*} textes les textes à tester
     */
    isPrivateMessage(message: Message): boolean {
        return message.channel.type === ChannelType.DM;
    }

    /**
     * Ajoute une reaction emoji si un texte est dans un message
     *
     * @param {*} message le message
     * @param {*} textes les textes à tester
     * @param {*} emoji l'emoji à ajouter
     */
    emojiReactionOnText(message: Message, textes: string[], emoji: string[]): boolean {
        if (this.contains(message, textes)) {
            this.emojiReaction(message, emoji);
            return true;
        }
        return false;
    }

    /**
     * Ajoute une reaction emoji sur un message
     *
     * @param {*} message le message
     * @param {*} emoji l'emoji à ajouter
     */
    async emojiReaction(message: Message, emojis: string[]): Promise<void> {
        for (const emoji of emojis) {
            await message.react(emoji);
        }
    }

    /**
     * Met en gras un texte
     *
     * @param {*} message le message
     */
    bold(message: string): string {
        return `**${message}**`;
    }

    /**
     * Met en souligné un texte
     *
     * @param {*} message le message
     */
    underline(message: string): string {
        return `__${message}__`;
    }

    /**
     * Met en italique un texte
     *
     * @param {*} message le message
     */
    italic(message: string): string {
        return `*${message}*`;
    }

    /**
     * Met en souligné et en gras un texte
     *
     * @param {*} message le message
     */
    boldUnderline(message: string): string {
        return this.bold(this.underline(message));
    }

    /**
     * Split un long message
     *
     * @param {*} message le message
     * @param {*} delimiteur le delimiteur
     */
    splitLongMessage(message: string, delimiteur: string): string[] {
        const tabSplit = message.split(delimiteur);
        const retour: string[] = [];
        let i = 0;
        for (const messageSplit of tabSplit) {
            i = (retour[i] ? retour[i].length : 0) + messageSplit.length + delimiteur.length >= 2040 ? ++i : i;
            retour[i] = retour[i] ? retour[i] + messageSplit + delimiteur : messageSplit + delimiteur;
        }
        return retour;
    }

    /**
     * Envoi un long message
     *
     * @param {*} message le message
     * @param {*} reponse la reponse
     * @param {*} delimiteur le delimiteur
     */
    async sendLongMessage(titre: string, message: Message, reponse: string, delimiteur: string): Promise<void> {
        const messageSplit = this.splitLongMessage(reponse, delimiteur);
        let i = 1;
        for (const boutDeMessage of messageSplit) {
            await message.channel.send({
                embeds: [
                    this.createEmbedMessage(
                        `${titre}${messageSplit.length !== 1 ? ` ${i++}/${messageSplit.length}` : ""}`,
                        boutDeMessage,
                    ),
                ],
            });
        }
    }

    /**
     * Construit un embed message générique avec le setup qu'il faut
     *
     * @param title le title, espace par défaut sinon erreur si vide
     * @param data la data, espace par défaut sinon erreur si vide
     * @param footer le footer, copyrights
     */
    createEmbedMessage(title = " ", data = " ", footer = "Made by vdeleeuw with ❤"): EmbedBuilder {
        // creation embed de base
        const messageEmbed = new EmbedBuilder();
        messageEmbed.setColor(resolveColor("Random"));
        messageEmbed.setTimestamp();

        // ajout data
        messageEmbed.setTitle(title);
        messageEmbed.setDescription(data);
        messageEmbed.setFooter({ text: footer });

        return messageEmbed;
    }
}
