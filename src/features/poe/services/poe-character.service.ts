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

        this.initDeathAlert();
    }

    /**
     * Lance la routine de controle des morts + alerts
     */
    private async initDeathAlert() {
        await this.initCharactersForAccountsDeathAlert();
        const delay: number = require("../../../../config.json").poe.deathalert.delay;
        setInterval(async () => {
            const channel: TextBasedChannel = this.alertPoeService.getDeathAlertChannel();
            if (channel) {
                for (const [account, characters] of this.characters.entries()) {
                    const setCharacters = new Set(characters.map((c) => JSON.stringify(c)));
                    const updatedCharacters = await this.getCharactersAccount(account);
                    const noDuplicatesCharacters = updatedCharacters.filter(
                        (c: PoeCharacter) => !setCharacters.has(JSON.stringify(c)),
                    );
                    for (const c of noDuplicatesCharacters) {
                        if (characters.map((ch) => ch.name).includes(c.name)) {
                            this.alertPoeService.getDeathAlertChannel().send({
                                embeds: [this.deathAlertPoeMessage(c)],
                            });
                        }
                    }
                    this.characters.set(account, updatedCharacters);
                }
            }
        }, delay);
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
     * Récupère les persos des comptes paramétrés dans le config.json
     */
    private async initCharactersForAccountsDeathAlert() {
        const accounts: string[] = require("../../../../config.json").poe.deathalert.accounts;
        for (const acc of accounts) {
            this.characters.set(acc, await this.getCharactersAccount(acc));
        }
    }

    /**
     * Ajoute les persos d'un compte dans le death alert
     * @param account compte a ajouter
     */
    async addCharactersForAccountDeathAlert(account: string) {
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
        return retour;
    }
}
