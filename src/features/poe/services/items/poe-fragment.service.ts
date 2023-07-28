import { injectable, inject } from "inversify";
import { TYPES } from "../../../../configuration";
import { PoeApiCallService, PoeLeagueService } from "..";
import { PoeItem, PoeItemType, PoeNinjaItem } from "../../models";
import { DateUtils } from "../../../../utils";

@injectable()
export class PoeFragmentService {
    private fragmentApiCache: PoeNinjaItem[] = [];
    private dateFragmentApiCache: Date;

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

        this.initFragmentNames();
    }

    /**
     * Récupère les rates
     */
    async getFragmentChaosRates(): Promise<PoeNinjaItem[]> {
        if (this.dateUtils.isOlderThanOneHour(new Date(), this.dateFragmentApiCache)) {
            const league = this.poeLeagueService.getCurrentLeague();
            const retourApi = (
                await this.poeApiCallService.getCurrencyOverview({ league: (await league).name, type: "Fragment" })
            ).data;
            this.fragmentApiCache = [];
            for (const ret of retourApi.lines) {
                this.fragmentApiCache.push({ name: ret.currencyTypeName, chaosEquivalent: ret.chaosEquivalent });
            }
            this.dateFragmentApiCache = new Date();
        }
        return this.fragmentApiCache;
    }

    /**
     * Filtre des items en fragment
     *
     * @param items les items a filtrer
     * @returns les fragments
     */
    filtrerFragments(items: PoeItem[]): PoeItem[] {
        return items.filter((i) => i.type === PoeItemType.FRAGMENT);
    }

    /**
     * Applique des rates de currency au fragments pour les estimer
     *
     * @param items les items a estimer
     * @returns les fragments estimés
     */
    async applyChaosRatesToFragments(items: PoeItem[]): Promise<PoeItem[]> {
        const rates = await this.getFragmentChaosRates();
        const estimatedItems = items.map((i) => {
            const fragmentRate = rates.find((r) => r.name === i.name);
            i.estimatedValueEach = fragmentRate.chaosEquivalent;
            return i;
        });
        return estimatedItems;
    }

    /**
     * Test les frag pour voir le nom
     *
     * @param nom le nom
     */
    isFragmentName(nom: string): boolean {
        return !!this.fragmentApiCache.find((x) => x.name === nom);
    }

    /**
     * init les noms des fragments
     */
    private async initFragmentNames(): Promise<void> {
        this.fragmentApiCache = await this.getFragmentChaosRates();
    }
}
