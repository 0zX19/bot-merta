import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class VolumeCommand extends Command {
    public constructor() {
        super("volume", {
            aliases: ["volume", "vol"],
            category: "Music",
            ratelimit: 3,
            channel: "guild",
            args: [{
                id: "index",
                type: "number",
                match: "rest"
            }]
        });
    }

    public async exec(message: Message, { index }: { index: number }): Promise<Message | void> {
        const player = this.client.music.players.get(message.guild!.id);
        if (!player) return message.channel.send("There is no current music playing now!");

        const { channel } = message.member!.voice;
        if (!channel) return message.channel.send("You must join VoiceChannel first!");
        if (channel.id !== player.voiceChannel) return message.channel.send("You must join the same channel as me!");

        index = parseInt(index as any);
        if (index > 100) index = 100;
        player.setVolume(index);
        return message.channel.send(`✅ Successfully set volume to: **${index}%**`);
    }
}
