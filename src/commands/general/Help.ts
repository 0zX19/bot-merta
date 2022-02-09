import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { stripIndents } from "common-tags";

export default class HelpCommand extends Command {
    public constructor() {
        super("help", {
            aliases: ["help", "h"],
            category: "General",
            description: {
                content: "Show available commands on the bot",
                usage: "help [ command ]",
                example: [
                    "help ping",
                    "h ping"
                ]
            },
            ratelimit: 3,
            args: [
                {
                    id: "command",
                    type: "commandAlias",
                    default: null
                }
            ],
            channel: "guild"
        });
    }

    public exec(message: Message, { command }: { command?: Command }): Promise<Message> {
        const avatar = this.client.user?.displayAvatarURL() as string;

        if (command) {
            return message.channel.send(new MessageEmbed()
                .setAuthor(`Help | ${this.client.user!.tag}`, this.client.user?.displayAvatarURL())
                .setColor(this.client.color)
                .setThumbnail(avatar)
                .setDescription(stripIndents`
            **Aliases**
            ${command.aliases.map(x => `\`${x}\``).join(" | ")}

            **Description**
            ${command.description.content || "No Content"}
            
            **Usage**
            ${command.description.usage || "No Usage Provided"}
            
            **Example**
            ${command.description.example ? command.description.example.map((e: string) => `\`${e}\``).join("\n") : "No Example Provided"}
            
            **Permission Request**
            ${command.clientPermissions || "No need permissions"}`));
        }
        const embed = new MessageEmbed()
            .setAuthor(`Help | ${this.client.user!.tag}`, this.client.user?.displayAvatarURL())
            .setColor(this.client.color)
            .setThumbnail(avatar)
            .setFooter(`${this.handler.prefix as string}help [ command ] for more information on a command.`);

        for (const category of this.handler.categories.values()) {
            if (["default"].includes(category.id)) continue;

            embed.addField(category.id, category
                .filter(cmd => cmd.aliases.length > 0)
                .map(cmd => `**\`${cmd.id}\`**`)
                .join(" | ") || "No Commands in this category.");
        }
        return message.channel.send(embed);
    }
}
