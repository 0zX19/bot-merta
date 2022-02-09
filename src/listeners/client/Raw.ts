import { Listener } from "discord-akairo";

export default class Raw extends Listener {
    public constructor() {
        super("raw", {
            emitter: "client",
            event: "raw"
        });
    }

    public async exec(d: any): Promise<void> {
        this.client.music.updateVoiceState(d);
    }
}
