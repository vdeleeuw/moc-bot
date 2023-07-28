import { injectable, inject } from "inversify";
import { TYPES } from "../../../../configuration";
import { PoeApiCallService, PoeLeagueService } from "..";
import { PoeItem, PoeItemType, PoeNinjaItem } from "../../models";
import { DateUtils } from "../../../../utils";

@injectable()
export class PoeMapService {
    private mapApiCache: PoeNinjaItem[] = [];
    private dateMapApiCache: Date;

    private poeApiCallService: PoeApiCallService;
    private poeLeagueService: PoeLeagueService;
    private dateUtils: DateUtils;

    constructor(
        @inject(TYPES.PoeApiCallService) poeApiCallService: PoeApiCallService,
        @inject(TYPES.PoeLeagueService) poeLeagueService: PoeLeagueService,
        @inject(TYPES.DateUtils) dateUtils: DateUtils,
    ) {
        this.poeApiCallService = poeApiCallService;
        this.poeLeagueService = poeLeagueService;
        this.dateUtils = dateUtils;

        this.initMapNames();
    }

    /**
     * Récupère les rates
     */
    async getMapChaosRates(): Promise<PoeNinjaItem[]> {
        if (this.dateUtils.isOlderThanOneHour(new Date(), this.dateMapApiCache)) {
            const league = this.poeLeagueService.getCurrentLeague();
            const retourApi = (
                await this.poeApiCallService.getItemOverview({ league: (await league).name, type: "Map" })
            ).data;
            this.mapApiCache = [];
            for (const ret of retourApi.lines) {
                this.mapApiCache.push({ name: ret.name, chaosEquivalent: ret.chaosValue });
            }
            this.dateMapApiCache = new Date();
        }
        return this.mapApiCache;
    }

    /**
     * Filtre des items en map
     *
     * @param items les items a filtrer
     * @returns les maps
     */
    filtrerMaps(items: PoeItem[]): PoeItem[] {
        return items.filter((i) => i.type === PoeItemType.MAP);
    }

    /**
     * Applique des rates de currency au maps pour les estimer
     *
     * @param items les items a estimer
     * @returns les maps estimés
     */
    async applyChaosRatesToMaps(items: PoeItem[]): Promise<PoeItem[]> {
        const rates = await this.getMapChaosRates();
        const estimatedItems = items.map((i) => {
            const mapRate = rates.find((r) => r.name === i.name);
            i.estimatedValueEach = mapRate.chaosEquivalent;
            return i;
        });
        return estimatedItems;
    }

    /**
     * Test avec les noms de maps
     */
    isMapName(nom: string): boolean {
        return !!this.mapApiCache.find((x) => x.name === nom);
    }

    /**
     * init les noms des maps
     */
    private async initMapNames(): Promise<void> {
        this.mapApiCache = await this.getMapChaosRates();
    }
}
