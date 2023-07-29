import { TextBasedChannel } from "discord.js";
import { injectable } from "inversify";

@injectable()
export class AlertPoeService {
    private alertChannel: TextBasedChannel;

    constructor() {}

    setAlertChannel(channel: TextBasedChannel): void {
        this.alertChannel = channel;
    }

    getAlertChannel(): TextBasedChannel {
        return this.alertChannel;
    }

    getAlertDelay(): number {
        return require("../../../../config.json").poe.alerts.delay;
    }
}
