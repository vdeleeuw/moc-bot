import { injectable, inject } from "inversify";
import { TYPES } from "../../../../configuration";
import {
    PoeCurrencyService,
    PoeFossilService,
    PoeDivinationCardService,
    PoeEssenceService,
    PoeFragmentService,
    PoeMapService,
    PoeOilService,
    PoeScarabService,
} from "..";
import {
    PoeApiItem,
    PoeItem,
    PoeItemType,
    PoeDivinationCard,
    PoeApiStashTab,
    PoeStashTabType,
    PoeStashTab,
} from "../../models";

@injectable()
export class PoeItemService {
    private poeCurrencyService: PoeCurrencyService;
    private poeFossilService: PoeFossilService;
    private poeDivinationCardService: PoeDivinationCardService;
    private poeEssenceService: PoeEssenceService;
    private poeMapService: PoeMapService;
    private poeOilService: PoeOilService;
    private poeScarabService: PoeScarabService;
    private poeFragmentService: PoeFragmentService;

    constructor(
        @inject(TYPES.PoeCurrencyService) poeCurrencyService: PoeCurrencyService,
        @inject(TYPES.PoeFossilService) poeFossilService: PoeFossilService,
        @inject(TYPES.PoeDivinationCardService) poeDivinationCardService: PoeDivinationCardService,
        @inject(TYPES.PoeEssenceService) poeEssenceService: PoeEssenceService,
        @inject(TYPES.PoeFragmentService) poeFragmentService: PoeFragmentService,
        @inject(TYPES.PoeMapService) poeMapService: PoeMapService,
        @inject(TYPES.PoeOilService) poeOilService: PoeOilService,
        @inject(TYPES.PoeScarabService) poeScarabService: PoeScarabService,
    ) {
        this.poeCurrencyService = poeCurrencyService;
        this.poeFossilService = poeFossilService;
        this.poeDivinationCardService = poeDivinationCardService;
        this.poeEssenceService = poeEssenceService;
        this.poeFragmentService = poeFragmentService;
        this.poeMapService = poeMapService;
        this.poeOilService = poeOilService;
        this.poeScarabService = poeScarabService;
    }

    /**
     * Estime les items
     *
     * @param items les items
     */
    async estimateItems(items: PoeItem[]): Promise<PoeItem[]> {
        // currencies
        const currencyItems = this.poeCurrencyService.filtrerCurrencies(items);
        const estimatedCurrency = this.poeCurrencyService.applyChaosRatesToCurrencies(currencyItems);
        // fossils
        const fossilItems = this.poeFossilService.filtrerFossils(items);
        const estimatedFossils = this.poeFossilService.applyChaosRatesToFossils(fossilItems);
        // essences
        const essenceItems = this.poeEssenceService.filtrerEssences(items);
        const estimatedEssences = this.poeEssenceService.applyChaosRatesToEssences(essenceItems);
        // div cards
        const divCardItems = this.poeDivinationCardService.filtrerDivinationCards(items);
        const estimatedDivCard = this.poeDivinationCardService.applyChaosRatesToDivinationCards(divCardItems);
        // fragments
        const fragmentItems = this.poeFragmentService.filtrerFragments(items);
        const estimatedFragments = this.poeFragmentService.applyChaosRatesToFragments(fragmentItems);
        // maps
        const mapItems = this.poeMapService.filtrerMaps(items);
        const estimatedMaps = this.poeMapService.applyChaosRatesToMaps(mapItems);
        // oils
        const oilItems = this.poeOilService.filtrerOils(items);
        const estimatedOils = this.poeOilService.applyChaosRatesToOils(oilItems);
        // scarabs
        const scarabItems = this.poeScarabService.filtrerScarabs(items);
        const estimatedScarabs = this.poeScarabService.applyChaosRatesToScarabs(scarabItems);
        return [
            ...(await estimatedCurrency),
            ...(await estimatedFossils),
            ...(await estimatedEssences),
            ...(await estimatedDivCard),
            ...(await estimatedFragments),
            ...(await estimatedMaps),
            ...(await estimatedOils),
            ...(await estimatedScarabs),
        ];
    }

    /**
     * Reducer items to chaos number
     *
     * @param items les items
     */
    getItemsValueInChaos(items: PoeItem[]): number {
        return items.reduce((acc, curr) => {
            const stackSize = curr.stackSize ?? 1;
            return acc + stackSize * curr.estimatedValueEach;
        }, 0);
    }

    /**
     * Retourne le type par rapport au nom
     *
     * @param itemName le nom
     */
    getItemTypeByName(nom: string): PoeItemType {
        if (this.poeCurrencyService.isCurrencyName(nom)) {
            return PoeItemType.CURRENCY;
        }
        if (this.poeFossilService.isFossilName(nom)) {
            return PoeItemType.FOSSIL;
        }
        if (this.poeDivinationCardService.isDivinationCardName(nom)) {
            return PoeItemType.DIVINATION_CARD;
        }
        if (this.poeEssenceService.isEssenceName(nom)) {
            return PoeItemType.ESSENCE;
        }
        if (this.poeFragmentService.isFragmentName(nom)) {
            return PoeItemType.FRAGMENT;
        }
        if (this.poeMapService.isMapName(nom)) {
            return PoeItemType.MAP;
        }
        if (this.poeOilService.isOilName(nom)) {
            return PoeItemType.OIL;
        }
        if (this.poeScarabService.isScarabName(nom)) {
            return PoeItemType.SCARAB;
        }
        return undefined;
    }

    /**
     * Construit un objet poe du bon type a partir de l'api
     *
     * @param poeApiItem l'objet
     * @param poeStashTab le stash ou est l'objet
     * @param account le nom du compte
     */
    buildNewPoeItem(
        poeApiItem: PoeApiItem,
        poeApiStashTab: PoeApiStashTab,
        account: string,
    ): PoeDivinationCard | PoeItem {
        const type = this.getItemTypeByName(poeApiItem.typeLine);
        const stashTab: PoeStashTab = {
            name: poeApiStashTab.n,
            position: poeApiStashTab.i,
            type: Object.values(PoeStashTabType).find((x) => PoeStashTabType[x] === poeApiStashTab.type),
            account,
        };
        switch (type) {
            case PoeItemType.DIVINATION_CARD:
                return {
                    name: poeApiItem.typeLine,
                    stackSize: poeApiItem.stackSize,
                    type,
                    stashTab,
                    maxStackSize: poeApiItem.maxStackSize,
                    reward: this.poeDivinationCardService.formatDivinationCardReward(
                        poeApiItem.explicitMods ? poeApiItem.explicitMods.join().trim() : "",
                    ),
                };
            default:
                return {
                    name: poeApiItem.typeLine,
                    stackSize: poeApiItem.stackSize,
                    type,
                    stashTab,
                };
        }
    }
}
