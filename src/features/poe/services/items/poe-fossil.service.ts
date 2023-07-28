import { injectable, inject } from "inversify";
import { TYPES } from "../../../../configuration";
import { PoeApiCallService, PoeLeagueService } from "..";
import { PoeItem, PoeItemType, PoeNinjaItem } from "../../models";
import { DateUtils } from "../../../../utils";

@injectable()
export class PoeFossilService {
    private fossilApiCache: PoeNinjaItem[] = [];
    private dateFossilApiCache: Date;

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

        this.initFossilNames();
    }

    /**
     * Récupère les rates
     */
    async getFossilChaosRates(): Promise<PoeNinjaItem[]> {
        if (this.dateUtils.isOlderThanOneHour(new Date(), this.dateFossilApiCache)) {
            const league = this.poeLeagueService.getCurrentLeague();
            const retourApi = (
                await this.poeApiCallService.getItemOverview({ league: (await league).name, type: "Fossil" })
            ).data;
            this.fossilApiCache = [];
            for (const ret of retourApi.lines) {
                this.fossilApiCache.push({ name: ret.name, chaosEquivalent: ret.chaosValue });
            }
            this.dateFossilApiCache = new Date();
        }
        return this.fossilApiCache;
    }

    /**
     * Filtre des items en fossil
     *
     * @param items les items a filtrer
     * @returns les fossils
     */
    filtrerFossils(items: PoeItem[]): PoeItem[] {
        return items.filter((i) => i.type === PoeItemType.FOSSIL);
    }

    /**
     * Applique des rates de currency au fossils pour les estimer
     *
     * @param items les items a estimer
     * @returns les fossils estimés
     */
    async applyChaosRatesToFossils(items: PoeItem[]): Promise<PoeItem[]> {
        const rates = await this.getFossilChaosRates();
        const estimatedItems = items.map((i) => {
            const fossilRate = rates.find((r) => r.name === i.name);
            i.estimatedValueEach = fossilRate.chaosEquivalent;
            return i;
        });
        return estimatedItems;
    }

    /**
     * Test si le nom est un fossil
     *
     * @param nom le nom
     */
    isFossilName(nom: string): boolean {
        return !!this.fossilApiCache.find((x) => x.name === nom);
    }

    /**
     * init les noms des fossils
     */
    private async initFossilNames(): Promise<void> {
        this.fossilApiCache = await this.getFossilChaosRates();
    }
}
