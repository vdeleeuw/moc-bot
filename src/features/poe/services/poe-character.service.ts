import { injectable, inject } from "inversify";
import { PoeApiCallService } from ".";
import { TYPES } from "../../../configuration";
import { PoeCharacter } from "../models";
import { EmbedBuilder, TextBasedChannel } from "discord.js";
import { MessageUtils } from "../../../utils";
import { AlertPoeService } from "../../alert/service";

@injectable()
export class PoeCharacterService {
    private poeApiCallService: PoeApiCallService;
    private messageUtils: MessageUtils;
    private alertPoeService: AlertPoeService;

    private characters: Map<string, PoeCharacter[]> = new Map<string, PoeCharacter[]>();

    constructor(
        @inject(TYPES.PoeApiCallService) poeApiCallService: PoeApiCallService,
        @inject(TYPES.MessageUtils) messageUtils: MessageUtils,
        @inject(TYPES.AlertPoeService) alertPoeService: AlertPoeService,
    ) {
        this.alertPoeService = alertPoeService;
        this.messageUtils = messageUtils;
        this.poeApiCallService = poeApiCallService;

        this.initPoeCharacterAlerts();
    }

    /**
     * Lance la routine de controle des morts + alerts
     */
    private async initPoeCharacterAlerts() {
        await this.initCharactersAccountAlerts();
        const delay: number = this.alertPoeService.getAlertDelay();
        setInterval(async () => {
            const channel: TextBasedChannel = this.alertPoeService.getAlertChannel();
            if (channel) {
                for (const [account, accCharacters] of this.characters.entries()) {
                    const setCharacters = new Set(accCharacters.map((c) => JSON.stringify(c)));
                    const updatedCharacters = await this.getCharactersAccount(account);
                    const noDuplicatesCharacters = updatedCharacters.filter(
                        (c: PoeCharacter) => !setCharacters.has(JSON.stringify(c)),
                    );
                    for (const newChar of noDuplicatesCharacters) {
                        const oldChar = accCharacters.find((x) => x.name === newChar.name);
                        // death
                        if (oldChar && newChar.experience < oldChar.experience) {
                            channel.send({
                                embeds: [this.deathAlertPoeMessage(newChar)],
                            });
                        }
                        // level up
                        if (oldChar && newChar.level > oldChar.level && (newChar.level % 10 || newChar.level > 70)) {
                            channel.send({
                                embeds: [this.levelAlertPoeMessage(newChar)],
                            });
                        }
                        // creation
                        if (!oldChar) {
                            channel.send({
                                embeds: [this.createAlertPoeMessage(newChar)],
                            });
                        }
                    }
                    if (updatedCharacters.length !== 0) {
                        this.characters.set(account, updatedCharacters);
                    }
                }
            }
        }, delay);
    }

    /**
     * Ecrit un message pour dire qu'un perso est créé
     * @param character le perso créé
     */
    createAlertPoeMessage(character: PoeCharacter): EmbedBuilder {
        return this.messageUtils.createEmbedMessage(
            "👶 PoE character creation 👶",
            `${this.messageUtils.bold(character.account)} has created a new ${this.messageUtils.bold(
                character.class,
            )} named ${this.messageUtils.bold(character.name)} in ${character.league} league.`,
        );
    }

    /**
     * Ecrit un message pour dire qui est mort
     * @param character le perso mort
     */
    deathAlertPoeMessage(character: PoeCharacter): EmbedBuilder {
        return this.messageUtils.createEmbedMessage(
            "💀 PoE death 💀",
            `${this.messageUtils.bold(character.account)}'s character ${this.messageUtils.bold(
                character.name,
            )} died at level ${this.messageUtils.bold(`${character.level}`)}.`,
        );
    }

    /**
     * Ecrit un message pour les levels
     * @param character le perso qui level
     */
    levelAlertPoeMessage(character: PoeCharacter): EmbedBuilder {
        return this.messageUtils.createEmbedMessage(
            "✨ PoE level up ✨",
            `${this.messageUtils.bold(character.account)}'s character ${this.messageUtils.bold(
                character.name,
            )} leveled up ${this.messageUtils.bold(`${character.level}`)} !`,
        );
    }

    /**
     * Récupère les persos des comptes paramétrés dans le config.json
     */
    private async initCharactersAccountAlerts() {
        const accounts: string[] = require("../../../../config.json").poe.alerts.accounts;
        for (const acc of accounts) {
            this.characters.set(acc, await this.getCharactersAccount(acc));
        }
    }

    /**
     * Ajoute les persos d'un compte dans le death alert
     * @param account compte a ajouter
     */
    async addCharactersAccountAlerts(account: string) {
        this.characters.set(account, await this.getCharactersAccount(account));
    }

    /**
     * Recupere les personnage d'un user
     *
     * @param user le user
     */
    async getCharactersAccount(user: string): Promise<PoeCharacter[]> {
        const personnages = await this.poeApiCallService.getCharacters({ accountName: user });
        const retour: PoeCharacter[] = [];
        if (personnages) {
            for (const p of personnages.data) {
                retour.push({
                    account: user,
                    class: p.class,
                    experience: p.experience,
                    league: p.league,
                    level: p.level,
                    name: p.name,
                });
            }
        }
        return retour;
    }
}
