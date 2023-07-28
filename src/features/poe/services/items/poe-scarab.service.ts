import { injectable, inject } from "inversify";
import { TYPES } from "../../../../configuration";
import { PoeApiCallService, PoeLeagueService } from "..";
import { PoeItem, PoeItemType, PoeNinjaItem } from "../../models";
import { DateUtils } from "../../../../utils";

@injectable()
export class PoeScarabService {
    private scarabApiCache: PoeNinjaItem[] = [];
    private dateScarabApiCache: Date;

    private poeApiCallService: PoeApiCallService;
    private poeLeagueService: PoeLeagueService;
    private dateUtils: DateUtils;

    constructor(
        @inject(TYPES.PoeApiCallService) poeApiCallService: PoeApiCallService,
        @inject(TYPES.PoeLeagueService) poeLeagueService: PoeLeagueService,
        @inject(TYPES.DateUtils) dateUtils: DateUtils,
    ) {
        this.poeApiCallService = poeApiCallService;
        this.dateUtils = dateUtils;
        this.poeLeagueService = poeLeagueService;

        this.initScarabNames();
    }

    /**
     * Récupère les rates
     */
    async getScarabChaosRates(): Promise<PoeNinjaItem[]> {
        if (this.dateUtils.isOlderThanOneHour(new Date(), this.dateScarabApiCache)) {
            const league = this.poeLeagueService.getCurrentLeague();
            const retourApi = (
                await this.poeApiCallService.getItemOverview({ league: (await league).name, type: "Scarab" })
            ).data;
            this.scarabApiCache = [];
            for (const ret of retourApi.lines) {
                this.scarabApiCache.push({ name: ret.name, chaosEquivalent: ret.chaosValue });
            }
            this.dateScarabApiCache = new Date();
        }
        return this.scarabApiCache;
    }

    /**
     * Filtre des items en scarab
     *
     * @param items les items a filtrer
     * @returns les scarabs
     */
    filtrerScarabs(items: PoeItem[]): PoeItem[] {
        return items.filter((i) => i.type === PoeItemType.SCARAB);
    }

    /**
     * Applique des rates de currency au scarabs pour les estimer
     *
     * @param items les items a estimer
     * @returns les scarabs estimés
     */
    async applyChaosRatesToScarabs(items: PoeItem[]): Promise<PoeItem[]> {
        const rates = await this.getScarabChaosRates();
        const estimatedItems = items.map((i) => {
            const scarabRate = rates.find((r) => r.name === i.name);
            i.estimatedValueEach = scarabRate.chaosEquivalent;
            return i;
        });
        return estimatedItems;
    }

    /**
     * Test le nom d'un item pour voir si c'est un scarab
     *
     * @param nom le nom
     */
    isScarabName(nom: string): boolean {
        return !!this.scarabApiCache.find((x) => x.name === nom);
    }

    /**
     * init les noms des scarabs
     */
    private async initScarabNames(): Promise<void> {
        this.scarabApiCache = await this.getScarabChaosRates();
    }
}
