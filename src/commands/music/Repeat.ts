import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class RepeatCommand extends Command {
    public constructor() {
        super("repeat", {
            aliases: ["repeat"],
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

        if (message.content.length && /queue/i.test(message.content)) {
            player.setQueueRepeat(!player.queueRepeat);
            const queueRepeat = player.queueRepeat ? "**Enable**" : "**Disable**";
            return message.channel.send(`${queueRepeat} queue repeat!`);
        }

        player.setTrackRepeat(!player.trackRepeat);
        const trackRepeat = player.trackRepeat ? "**Enable**" : "**Disable**";
        return message.channel.send(`${trackRepeat} track repeat!`);
    }
}
