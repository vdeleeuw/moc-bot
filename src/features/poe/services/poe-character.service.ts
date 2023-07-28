import { injectable, inject } from "inversify";
import { PoeApiCallService } from ".";
import { TYPES } from "../../../configuration";
import { PoeCharacter } from "../models";

@injectable()
export class PoeCharacterService {
    private poeApiCallService: PoeApiCallService;

    constructor(@inject(TYPES.PoeApiCallService) poeApiCallService: PoeApiCallService) {
        this.poeApiCallService = poeApiCallService;
    }

    /**
     * Recupere les personnage d'un user
     *
     * @param user le user
     */
    async getCharactersNameForPlayer(user: string): Promise<string[]> {
        return (await this.getCharactersAccount(user)).map((personnage) => personnage.name);
    }

    /**
     * Recupere les personnage d'un user
     *
     * @param user le user
     */
    private async getCharactersAccount(user: string): Promise<PoeCharacter[]> {
        const personnages = await this.poeApiCallService.getCharacters({ accountName: user });
        const retour: PoeCharacter[] = [];
        for (const p of personnages.data) {
            retour.push({ class: p.class, experience: p.experience, league: p.league, level: p.level, name: p.name });
        }
        return retour;
    }
}
