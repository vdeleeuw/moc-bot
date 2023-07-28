import { injectable, inject } from "inversify";
import { TYPES } from "../../../../configuration";
import { PoeApiCallService, PoeLeagueService } from "..";
import { DateUtils } from "../../../../utils";
import { PoeItem, PoeItemType, PoeNinjaItem } from "../../models";

@injectable()
export class PoeCurrencyService {
    private currencyApiCache: PoeNinjaItem[] = [];
    private dateCurrencyApiCache: Date;

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

        this.initCurrencies();
    }

    /**
     * Récupère les rates
     */
    async getCurrencyChaosRates(): Promise<PoeNinjaItem[]> {
        if (this.dateUtils.isOlderThanOneHour(new Date(), this.dateCurrencyApiCache)) {
            const league = this.poeLeagueService.getCurrentLeague();
            const retourApi = (
                await this.poeApiCallService.getCurrencyOverview({ league: (await league).name, type: "Currency" })
            ).data;
            // on ajoute la chaos en ref
            this.currencyApiCache = [{ name: "Chaos Orb", chaosEquivalent: 1 }];
            for (const ret of retourApi.lines) {
                this.currencyApiCache.push({ name: ret.currencyTypeName, chaosEquivalent: ret.chaosEquivalent });
            }
            this.dateCurrencyApiCache = new Date();
        }
        return this.currencyApiCache;
    }

    /**
     * Filtre des items en currency
     *
     * @param items les items a filtrer
     * @returns les currencies
     */
    filtrerCurrencies(items: PoeItem[]): PoeItem[] {
        return items.filter((i) => i.type === PoeItemType.CURRENCY);
    }

    /**
     * Applique des rates de currency au currency pour les estimer
     *
     * @param items les items a estimer
     * @returns les currencies estimés
     */
    async applyChaosRatesToCurrencies(items: PoeItem[]): Promise<PoeItem[]> {
        const rates = await this.getCurrencyChaosRates();
        return items.map((i) => {
            const currencyRate = rates.find((r) => r.name === i.name);
            i.estimatedValueEach = currencyRate.chaosEquivalent;
            return i;
        });
    }

    /**
     * Test si c'est une currency
     *
     * @param nom le nom
     */
    isCurrencyName(nom: string): boolean {
        return !!this.currencyApiCache.find((x) => x.name === nom);
    }

    /**
     * init les noms des currencies
     */
    private async initCurrencies(): Promise<void> {
        this.currencyApiCache = await this.getCurrencyChaosRates();
    }
}
