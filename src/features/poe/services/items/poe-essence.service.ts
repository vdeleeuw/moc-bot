import { injectable, inject } from "inversify";
import { TYPES } from "../../../../configuration";
import { PoeApiCallService, PoeLeagueService } from "..";
import { PoeItem, PoeItemType, PoeNinjaItem } from "../../models";
import { DateUtils } from "../../../../utils";

@injectable()
export class PoeEssenceService {
    private essenceApiCache: PoeNinjaItem[] = [];
    private dateEssenceApiCache: Date;

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

        this.initEssenceNames();
    }

    /**
     * Récupère les rates
     */
    async getEssenceChaosRates(): Promise<PoeNinjaItem[]> {
        if (this.dateUtils.isOlderThanOneHour(new Date(), this.dateEssenceApiCache)) {
            const league = this.poeLeagueService.getCurrentLeague();
            const retourApi = (
                await this.poeApiCallService.getItemOverview({ league: (await league).name, type: "Essence" })
            ).data;
            this.essenceApiCache = [];
            for (const ret of retourApi.lines) {
                this.essenceApiCache.push({ name: ret.name, chaosEquivalent: ret.chaosValue });
            }
            this.dateEssenceApiCache = new Date();
        }
        return this.essenceApiCache;
    }

    /**
     * Filtre des items en essence
     *
     * @param items les items a filtrer
     * @returns les essences
     */
    filtrerEssences(items: PoeItem[]): PoeItem[] {
        return items.filter((i) => i.type === PoeItemType.ESSENCE);
    }

    /**
     * Applique des rates de currency au essences pour les estimer
     *
     * @param items les items a estimer
     * @returns les essences estimés
     */
    async applyChaosRatesToEssences(items: PoeItem[]): Promise<PoeItem[]> {
        const rates = await this.getEssenceChaosRates();
        const estimatedItems = items.map((i) => {
            const essenceRate = rates.find((r) => r.name === i.name);
            i.estimatedValueEach = essenceRate.chaosEquivalent;
            return i;
        });
        return estimatedItems;
    }

    /**
     * Test les noms de essence
     *
     * @param nom le nom a test
     */
    isEssenceName(nom: string): boolean {
        return !!this.essenceApiCache.find((x) => x.name === nom);
    }

    /**
     * init les noms des essences
     */
    private async initEssenceNames(): Promise<void> {
        this.essenceApiCache = await this.getEssenceChaosRates();
    }
}
