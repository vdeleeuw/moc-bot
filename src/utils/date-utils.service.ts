import { injectable } from "inversify";

@injectable()
export class DateUtils {
    /**
     * Test si une date est plus vieille d'au moins une heure
     *
     * @param {*} date1 la date1
     * @param {*} date2 la date2
     */
    isOlderThanOneHour(date1: Date, date2: Date): boolean {
        return date1 && date2 ? date1.getTime() - date2.getTime() > 3600000 : true;
    }
}
