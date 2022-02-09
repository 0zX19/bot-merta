import { Listener, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class MissingPermissions extends Listener {
    public constructor() {
        super("MissingPermissions", {
            emitter: "CommandHandler",
            event: "missingPermissions"
        });
    }

    public async exec(message: Message, command: Command, type: "client" | "user", missing: any): Promise<Message | void> {
        switch (type) {
            case "client":
                return message.util?.send(
                    new MessageEmbed()
                        .setColor(this.client.color)
                        .setAuthor(`Missing Permissions at ( ${command.id} )`)
                        .setDescription([
                            `Oh no, i dont't have ${this.formatPermissions(message, missing)} permissions, make sure you give me this permissions`
                        ])
                );
            case "user":
                return message.util?.send(
                    new MessageEmbed()
                        .setColor(this.client.color)
                        .setAuthor(`Missing Permissions at ( ${command.id} )`)
                        .setDescription([
                            `Oh no, you don't have ${this.formatPermissions(message, missing)} permissions`
                        ])
                );
        }
    }

    public formatPermissions(message: Message, permissions: any[]) {
        const result: any = message.member?.permissions.missing(permissions).map(str => `**${str.replace(/_/g, " ").toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}**`);
        return result.length > 1 ? `${result.slice(0, -1).join(", ")} and ${result.slice(-1)[0]}` : result[0];
    }
}
