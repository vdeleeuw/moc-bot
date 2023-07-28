import { Message, SlashCommandBuilder } from "discord.js";
import { injectable, inject } from "inversify";
import {
    PoeCharacterService,
    PoeLeagueService,
    PoeCurrencyService,
    PoeStashService,
    PoeUserService,
} from "../../../features/poe/services";
import { TYPES } from "../../../configuration";
import { LoggerUtils, MessageUtils } from "../../../utils";
import { MessageEmoji } from "../constants";

@injectable()
export class MessagePoeService {
    private poeCharacterService: PoeCharacterService;
    private poeLeagueService: PoeLeagueService;
    private poeCurrencyService: PoeCurrencyService;
    private poeStashService: PoeStashService;
    private poeTokenService: PoeUserService;
    private messageUtils: MessageUtils;
    private loggerUtils: LoggerUtils;

    constructor(
        @inject(TYPES.PoeCharacterService) poeCharacterService: PoeCharacterService,
        @inject(TYPES.PoeLeagueService) poeLeagueService: PoeLeagueService,
        @inject(TYPES.PoeCurrencyService) poeCurrencyService: PoeCurrencyService,
        @inject(TYPES.PoeStashService) poeStashService: PoeStashService,
        @inject(TYPES.PoeUserService) poeTokenService: PoeUserService,
        @inject(TYPES.MessageUtils) messageUtils: MessageUtils,
        @inject(TYPES.LoggerUtils) loggerUtils: LoggerUtils,
    ) {
        this.poeCharacterService = poeCharacterService;
        this.poeLeagueService = poeLeagueService;
        this.poeCurrencyService = poeCurrencyService;
        this.poeStashService = poeStashService;
        this.poeTokenService = poeTokenService;
        this.messageUtils = messageUtils;
        this.loggerUtils = loggerUtils;
    }

    /**
     * Après un message
     *
     * @param {*} message le message
     */
    onMessage(message: Message): boolean {
        // commande poe
        if (message.content.startsWith("!poe")) {
            const commandArguments = message.content.toLowerCase().split(" ");
            // gestion des commandes
            switch (commandArguments[1]) {
                // affichage de l'aide
                case "help":
                    this.sendHelpMessage(message);
                    return true;

                // affichage des persos d'un compte
                case "characters":
                    this.sendCharactersCompteMessage(message, commandArguments[2]);
                    return true;

                // affichage des indos d'une league
                case "league":
                    switch (commandArguments[2]) {
                        case "clear":
                            this.sendResetCurrentLeagueMessage(message);
                            return true;

                        default:
                            this.sendCurrentLeagueMessage(message);
                            return true;
                    }

                // affichage des rates de currency
                case "rates":
                    this.sendCurrencyRatesMessage(message);
                    return true;

                // affichage des cards
                case "div":
                    switch (commandArguments[2]) {
                        case "stacks":
                            this.sendCompleteStacksDivinationCardsPlayersMessage(message);
                            return true;

                        case "nostacks":
                            this.sendDivinationCardsPlayersMessage(message);
                            return true;

                        case "all":
                            this.sendAllDivinationCardsAllPlayersMessage(message);
                            return true;
                    }

                // affichage des values du stash
                case "stash":
                    this.sendTotalStashValueMessage(message, commandArguments[2]);
                    return true;

                // sauvegarde le token pour les appels
                case "token":
                    switch (commandArguments[2]) {
                        case "mine":
                            this.sendMineTokenMessage(message);
                            return true;

                        case "clear":
                            this.poeTokenService.clearPoeUsers();
                            message.channel.send({
                                embeds: [this.messageUtils.createEmbedMessage("Tokens PoE deleted.")],
                            });
                            return true;

                        default:
                            this.sendTokenSaveMessage(message, commandArguments[2], commandArguments[3]);
                            return true;
                    }

                default:
                    message.channel.send({ embeds: [this.messageUtils.createEmbedMessage("Unknown command.")] });
                    break;
            }
        }
        return false;
    }

    /**
     * Répond au message de token mine
     *
     * @param message le message
     */
    private async sendMineTokenMessage(message: Message): Promise<void> {
        message.channel.send({
            embeds: [
                this.messageUtils.createEmbedMessage(
                    this.poeTokenService.getPoeUserFromDiscordTag(message?.author?.tag)?.token ?? "Token not found.",
                ),
            ],
        });
    }

    /**
     * Répond au message de token save
     *
     * @param message le message
     * @param poeAccount le compte poe
     * @param token le token
     */
    private async sendTokenSaveMessage(message: Message, poeAccount: string, token: string): Promise<void> {
        if (this.poeTokenService.saveToken(message?.author?.tag, poeAccount, token)) {
            message.channel.send({
                embeds: [this.messageUtils.createEmbedMessage("Token PoE saved !")],
            });
        } else {
            message.channel.send({
                embeds: [
                    this.messageUtils.createEmbedMessage(
                        `${MessageEmoji.CROIX} Error saving token`,
                        "!poe help for more information.",
                    ),
                ],
            });
        }
    }

    /**
     * Répond au message de stack de card
     *
     * @param message le message
     */
    private async sendCompleteStacksDivinationCardsPlayersMessage(message: Message): Promise<void> {
        try {
            this.messageUtils.sendLongMessage(
                "Completed card sets",
                message,
                (await this.poeStashService.getCompleteDivinationCardAllUsers()).reduce(
                    (acc, card) =>
                        acc +
                        `${this.messageUtils.bold(card.name)} (${card.stackSize}/${card.maxStackSize}) → ${
                            card.reward
                        }\n`,
                    "",
                ),
                "\n",
            );
        } catch (err) {
            this.loggerUtils.logError(err);
            await message.channel.send({
                embeds: [this.messageUtils.createEmbedMessage(`${MessageEmoji.CROIX} Error getting cards !`, err)],
            });
        }
    }

    /**
     * Répond au message de stack de card
     *
     * @param message le message
     */
    private async sendAllDivinationCardsAllPlayersMessage(message: Message): Promise<void> {
        try {
            await this.messageUtils.sendLongMessage(
                "All cards",
                message,
                (await this.poeStashService.getAllDivinationCardStashAllUsers()).reduce(
                    (acc, card) =>
                        acc +
                        `${this.messageUtils.bold(card.name)} (${card.stackSize}/${card.maxStackSize}) → ${
                            card.reward
                        }\n`,
                    "",
                ),
                "\n",
            );
        } catch (err) {
            this.loggerUtils.logError(err);
            await message.channel.send({
                embeds: [this.messageUtils.createEmbedMessage(`${MessageEmoji.CROIX} Error getting cards !`, err)],
            });
        }
    }

    /**
     * Répond au message de non stacks de card
     *
     * @param message le message
     */
    private async sendDivinationCardsPlayersMessage(message: Message): Promise<void> {
        try {
            await this.messageUtils.sendLongMessage(
                "Card sets not completed",
                message,
                (await this.poeStashService.getNotCompleteDivinationCardStashAllUsers()).reduce(
                    (acc, card) =>
                        acc +
                        `${this.messageUtils.bold(card.name)} (${card.stackSize}/${card.maxStackSize}) → ${
                            card.reward
                        }\n`,
                    "",
                ),
                "\n",
            );
        } catch (err) {
            this.loggerUtils.logError(err);
            await message.channel.send({
                embeds: [this.messageUtils.createEmbedMessage(`${MessageEmoji.CROIX} Error getting cards !`, err)],
            });
        }
    }

    /**
     * Répond au message de currency
     *
     * @param message le message
     */
    private async sendCurrencyRatesMessage(message: Message): Promise<void> {
        try {
            await message.channel.send({
                embeds: [
                    this.messageUtils.createEmbedMessage(
                        "PoE rates",
                        (await this.poeCurrencyService.getCurrencyChaosRates()).reduce(
                            (acc, curr) =>
                                acc + `${curr.name} = ${this.messageUtils.bold(`${curr.chaosEquivalent}`)}c\n`,
                            "",
                        ),
                    ),
                ],
            });
        } catch (err) {
            this.loggerUtils.logError(err);
            await message.channel.send({
                embeds: [
                    this.messageUtils.createEmbedMessage(`${MessageEmoji.CROIX} Error getting currency rates !`, err),
                ],
            });
        }
    }

    /**
     * Répond au message de stash value
     *
     * @param message le message
     */
    private async sendTotalStashValueMessage(message: Message, requestedAccount?: string): Promise<void> {
        try {
            const account =
                requestedAccount ?? this.poeTokenService.getPoeUserFromDiscordTag(message?.author?.tag)?.accountName;
            await message.channel.send({
                embeds: [
                    this.messageUtils.createEmbedMessage(
                        `Stash value of ${account}`,
                        `${await this.poeStashService.getTotalStashValue(account)} chaos`,
                    ),
                ],
            });
        } catch (err) {
            this.loggerUtils.logError(err);
            await message.channel.send({
                embeds: [
                    this.messageUtils.createEmbedMessage(`${MessageEmoji.CROIX} Error getting stash value !`, err),
                ],
            });
        }
    }

    /**
     * Répond au message d'un compte
     *
     * @param message le message
     * @param compte le nom du compte
     */
    private async sendCharactersCompteMessage(message: Message, compte: string): Promise<void> {
        try {
            const personnages = (await this.poeCharacterService.getCharactersNameForPlayer(compte)).join("\n");
            message.channel.send({
                embeds: [this.messageUtils.createEmbedMessage(`Characters of ${compte}`, personnages)],
            });
        } catch (err) {
            this.loggerUtils.logError(err);
            await message.channel.send({
                embeds: [
                    this.messageUtils.createEmbedMessage(
                        `${MessageEmoji.CROIX} Error account not found or private !`,
                        err,
                    ),
                ],
            });
        }
    }

    /**
     * Répond au message d'une league
     *
     * @param message le message
     */
    private async sendCurrentLeagueMessage(message: Message): Promise<void> {
        try {
            const league = await this.poeLeagueService.getCurrentLeague();
            await message.channel.send({
                embeds: [
                    this.messageUtils.createEmbedMessage("Current league", `${league.name}, ${league.description}`),
                ],
            });
        } catch (err) {
            this.loggerUtils.logError(err);
            await message.channel.send({
                embeds: [this.messageUtils.createEmbedMessage(`${MessageEmoji.CROIX} Error on league search !`, err)],
            });
        }
    }

    /**
     * Répond au message de reset d'une league
     *
     * @param message le message
     */
    private async sendResetCurrentLeagueMessage(message: Message): Promise<void> {
        try {
            this.poeLeagueService.resetCurrentLeague();
            await message.channel.send({
                embeds: [this.messageUtils.createEmbedMessage("Current league is reset.")],
            });
        } catch (err) {
            this.loggerUtils.logError(err);
            await message.channel.send({
                embeds: [this.messageUtils.createEmbedMessage(`${MessageEmoji.CROIX} Error on league search !`, err)],
            });
        }
    }

    /**
     * Répond au message d'aide
     *
     * @param message le message
     */
    private async sendHelpMessage(message: Message): Promise<void> {
        const corpsMessage = `\
        ${this.messageUtils.boldUnderline("PoE characters")}
        ${this.messageUtils.bold("!poe characters [account]")} → List all characters from [account]

        ${this.messageUtils.boldUnderline("PoE rates")}
        ${this.messageUtils.bold("!poe rates")} → List currency rates from poe.ninja

        ${this.messageUtils.boldUnderline("PoE leagues")}
        ${this.messageUtils.bold("!poe league")} → Display bot current league
        ${this.messageUtils.bold("!poe league clear")} → Reset bot league

        ${this.messageUtils.boldUnderline("PoE divination cards")}
        ${this.messageUtils.bold("!poe div stacks")} → List all card sets completed with a worth/card > 1c
        ${this.messageUtils.bold("!poe div nostacks")} → List all card sets uncompleted with a worth/card > 1c
        ${this.messageUtils.bold("!poe div all")} → List all card sets of all players

        ${this.messageUtils.boldUnderline("PoE stash")}
        ${this.messageUtils.bold("!poe stash [account]")} → Calculate stash value for [account]

        ${this.messageUtils.boldUnderline("PoE token")}
        ${this.messageUtils.bold("!poe token mine")} → Display my saved PoE token
        ${this.messageUtils.bold("!poe token [account] [token]")} → Save the [account] PoE [token] (POESESSID)
        ${this.messageUtils.bold("!poe token clear")} → Reset all saved PoE tokens`;

        await message.channel.send({
            embeds: [this.messageUtils.createEmbedMessage("PoE commands", corpsMessage)],
        });
    }
}
