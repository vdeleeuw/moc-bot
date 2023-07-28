import { injectable, inject } from "inversify";
import { PoeApiCallService } from ".";
import { TYPES } from "../../../configuration";
import { PoeLeague } from "../models";

@injectable()
export class PoeLeagueService {
    private currentLeague: Promise<PoeLeague> = undefined;

    private poeApiCallService: PoeApiCallService;

    constructor(@inject(TYPES.PoeApiCallService) poeApiCallService: PoeApiCallService) {
        this.poeApiCallService = poeApiCallService;
    }

    /**
     * Récupere les leagues
     */
    async getLeagues(): Promise<PoeLeague[]> {
        const leagues = await this.poeApiCallService.getChallengeLeagues({ type: "main" });
        const retour: PoeLeague[] = [];
        for (const l of leagues.data) {
            retour.push({
                id: l.id,
                description: l.description,
                endAt: new Date(l.endAt),
                name: l.id,
                registerAt: new Date(l.registerAt),
                rules: l.rules,
                startAt: new Date(l.startAt),
            });
        }
        return retour;
    }

    /**
     * Reset la league (ex changement de league)
     */
    resetCurrentLeague(): void {
        this.currentLeague = undefined;
    }

    /**
     * Récupere la league temp standard ou la league cherchée
     * @param leagueName la league qu'on cherche
     */
    async getCurrentLeague(): Promise<PoeLeague> {
        if (this.currentLeague === undefined) {
            this.currentLeague = this.fetchTempChallengeLeagueStandard();
        }
        return this.currentLeague;
    }

    /**
     * Récupere la league temp standard ou la private si elle existe
     */
    async getPrivateLeagueOrChallengeLeague(): Promise<PoeLeague> {
        const privateLeague = require("../../../../config.json").poe.privateLeague;
        return privateLeague.name && privateLeague.id
            ? Promise.resolve({
                  id: privateLeague.id,
                  name: privateLeague.name,
                  description: "",
                  registerAt: null,
                  startAt: null,
                  endAt: null,
                  rules: [],
              })
            : this.getCurrentLeague();
    }

    /**
     * Récupere la league temp standard ou le standard
     */
    private async fetchTempChallengeLeagueStandard(): Promise<PoeLeague> {
        return (await this.getLeagues())
            .filter((x) => x.rules.length === 0)
            .sort((x, y) => y.startAt.getTime() - x.startAt.getTime())[0];
    }
}
