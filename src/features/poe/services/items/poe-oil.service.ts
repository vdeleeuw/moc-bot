import { injectable, inject } from "inversify";
import { TYPES } from "../../../../configuration";
import { PoeApiCallService, PoeLeagueService } from "..";
import { PoeItem, PoeItemType, PoeNinjaItem } from "../../models";
import { DateUtils } from "../../../../utils";

@injectable()
export class PoeOilService {
    private oilApiCache: PoeNinjaItem[] = [];
    private dateOilApiCache: Date;

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

        this.initOilNames();
    }

    /**
     * Récupère les rates
     */
    async getOilChaosRates(): Promise<PoeNinjaItem[]> {
        if (this.dateUtils.isOlderThanOneHour(new Date(), this.dateOilApiCache)) {
            const league = this.poeLeagueService.getCurrentLeague();
            const retourApi = (
                await this.poeApiCallService.getItemOverview({ league: (await league).name, type: "Oil" })
            ).data;
            this.oilApiCache = [];
            for (const ret of retourApi.lines) {
                this.oilApiCache.push({ name: ret.name, chaosEquivalent: ret.chaosValue });
            }
            this.dateOilApiCache = new Date();
        }
        return this.oilApiCache;
    }

    /**
     * Filtre des items en oil
     *
     * @param items les items a filtrer
     * @returns les oils
     */
    filtrerOils(items: PoeItem[]): PoeItem[] {
        return items.filter((i) => i.type === PoeItemType.OIL);
    }

    /**
     * Applique des rates de currency au oils pour les estimer
     *
     * @param items les items a estimer
     * @returns les oils estimés
     */
    async applyChaosRatesToOils(items: PoeItem[]): Promise<PoeItem[]> {
        const rates = await this.getOilChaosRates();
        const estimatedItems = items.map((i) => {
            const oilRate = rates.find((r) => r.name === i.name);
            i.estimatedValueEach = oilRate.chaosEquivalent;
            return i;
        });
        return estimatedItems;
    }

    /**
     * Test les noms d'oil
     *
     * @param nom le nom
     */
    isOilName(nom: string): boolean {
        return !!this.oilApiCache.find((x) => x.name === nom);
    }

    /**
     * init les noms des oils
     */
    private async initOilNames(): Promise<void> {
        this.oilApiCache = await this.getOilChaosRates();
    }
}
