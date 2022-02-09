import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class PingCommand extends Command {
    public constructor() {
        super("ping", {
            aliases: ["ping"],
            category: "General",
            ratelimit: 3,
            channel: "guild"
        });
    }

    public exec(message: Message): Promise<Message> {
        const msg = Date.now() - message.createdTimestamp;
        return message.channel.send(`WS: \`${this.client.ws.ping}\`ms\nLatency: \`${msg}\`ms`);
    }
}
