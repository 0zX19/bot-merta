import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class PauseCommand extends Command {
    public constructor() {
        super("pause", {
            aliases: ["pause"],
            category: "Music",
            ratelimit: 3,
            channel: "guild"
        });
    }

    public async exec(message: Message): Promise<Message | void> {
        const player = this.client.music.players.get(message.guild!.id);
        if (!player) return message.channel.send(`There is not current music playing!`);

        const { channel } = message.member!.voice;
        if (!channel) return message.channel.send("You must join voice channel first!");
        if (channel.id !== player.voiceChannel) return message.channel.send(`You must join the same channel as me!`);

        player.pause(!player.paused);
        const playerPaused = player.paused ? "**Pausing** Music!" : "**Resuming** Music!";
        return message.channel.send(playerPaused);
    }
}
