import { injectable, inject } from "inversify";
import { TYPES } from "../../../../configuration";
import { PoeApiCallService, PoeLeagueService } from "..";
import { DateUtils } from "../../../../utils";
import { PoeItem, PoeItemType, PoeNinjaDivinationCard, PoeDivinationCard, PoeUser } from "../../models";

@injectable()
export class PoeDivinationCardService {
    private allDivinationCards: PoeNinjaDivinationCard[] = [];
    private dateDivinationCardsApiCache: Date;

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

        this.initDivinationCards();
    }

    /**
     * Récupère les rates
     */
    async getDivinationCardsRates(): Promise<PoeNinjaDivinationCard[]> {
        if (this.dateUtils.isOlderThanOneHour(new Date(), this.dateDivinationCardsApiCache)) {
            const league = this.poeLeagueService.getCurrentLeague();
            const retourApi = (
                await this.poeApiCallService.getItemOverview({ league: (await league).name, type: "DivinationCard" })
            ).data;
            this.allDivinationCards = [];
            for (const ret of retourApi.lines) {
                this.allDivinationCards.push({
                    name: ret.name,
                    chaosEquivalent: ret.chaosValue,
                    reward: this.formatDivinationCardReward(ret?.explicitModifiers?.text),
                    stackReward: ret?.stackSize,
                });
            }
            this.dateDivinationCardsApiCache = new Date();
        }
        return this.allDivinationCards;
    }

    /**
     * Combine les différents stacks d'une meme div card
     *
     * @param items les items a combiner
     */
    buildDivinationCardStacks(items: PoeDivinationCard[]): PoeItem[] {
        const retour: PoeDivinationCard[] = [];
        for (const item of items) {
            const existingCard = retour.find((x) => x.name === item.name);
            if (existingCard) {
                existingCard.stackSize += item.stackSize;
            } else {
                retour.push(item);
            }
        }
        return retour;
    }

    /**
     * Filtre des items en divinationCard
     *
     * @param items les items a filtrer
     * @param la valeur minmum les items a filtrer
     * @returns les divinationCards
     */
    filtrerDivinationCards(items: PoeDivinationCard[], minimumValue = 0): PoeItem[] {
        if (minimumValue !== 0) {
            return items.filter(
                (i) =>
                    (i.type === PoeItemType.DIVINATION_CARD || i instanceof PoeDivinationCard) &&
                    i.estimatedValueEach > minimumValue,
            );
        } else {
            return items.filter((i) => i.type === PoeItemType.DIVINATION_CARD || i instanceof PoeDivinationCard);
        }
    }

    /**
     * Filtre les non full stacks de cartes
     *
     * @param items les cartes
     */
    filtrerNotFullStacksDivinationCards(items: PoeDivinationCard[]): PoeDivinationCard[] {
        return items.filter((x) => x.stackSize < x.maxStackSize);
    }

    /**
     * Filtre les stacks de cartes
     *
     * @param items les cartes
     */
    filtrerFullStacksDivinationCards(items: PoeDivinationCard[]): PoeDivinationCard[] {
        return items.filter((x) => x.stackSize >= x.maxStackSize);
    }

    /**
     * Trie les stacks de cartes des plus complétés d'abord
     *
     * @param items les cartes
     */
    sortByCompletionDesc(items: PoeDivinationCard[]): PoeDivinationCard[] {
        return items.sort((a, b) => b.stackSize / b.maxStackSize - a.stackSize / a.maxStackSize);
    }

    /**
     * Applique des rates de currency au divinationCards pour les estimer
     *
     * @param items les items a estimer
     * @returns les divinationCards estimés
     */
    async applyChaosRatesToDivinationCards(items: PoeDivinationCard[]): Promise<PoeDivinationCard[]> {
        const rates = await this.getDivinationCardsRates();
        const estimatedItems = items.map((i) => {
            const divinationCardRate = rates.find((r) => r.name === i.name);
            i.estimatedValueEach = divinationCardRate.chaosEquivalent;
            return i;
        });
        return estimatedItems;
    }

    /**
     * Test si le nom est une div card
     *
     * @param nom le nom
     */
    isDivinationCardName(nom: string): boolean {
        return !!this.allDivinationCards.find((x) => x.name === nom);
    }

    /**
     * format le texte des rewards
     *
     * @param text le text a formater
     * @returns le nouveau text
     */
    formatDivinationCardReward(text: string): string {
        return text ? text.match(new RegExp(/[^{\}]+(?=})/g)).join(" ") : "";
    }

    /**
     * Fait des stacks de cards pour tout le monde
     *
     * @param itemsByUser tout les items
     * @param minValue valeur minimum de la carte
     */
    prepareCardsStacksAllUsers(itemsByUser: Map<PoeUser, PoeItem[]>, minValue: number): PoeDivinationCard[] {
        // je stack les cartes de chacun et garde que celles de valeur et non full stacks
        // eslint-disable-next-line prefer-const
        for (let [user, items] of itemsByUser) {
            items = this.filtrerDivinationCards(items, minValue);
            items = this.buildDivinationCardStacks(items);
            itemsByUser.set(user, items);
        }
        // on met en commun les cartes pour voir celle qui sont complétés
        const allCards: PoeDivinationCard[] = [];
        for (const [, items] of itemsByUser.entries()) {
            for (const item of items) {
                const existingCard = allCards.find((x) => x.name === item.name);
                if (existingCard) {
                    existingCard.stackSize += item.stackSize;
                } else {
                    allCards.push(item);
                }
            }
        }
        return allCards;
    }

    /**
     * init les noms des divinationCards
     */
    private async initDivinationCards(): Promise<void> {
        this.allDivinationCards = await this.getDivinationCardsRates();
    }
}
