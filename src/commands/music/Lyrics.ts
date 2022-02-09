import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import fetch from "node-superfetch";

export default class LyricsCommand extends Command {
    public constructor() {
        super("lyrics", {
            aliases: ["lyrics", "ly"],
            category: "Music",
            ratelimit: 3,
            channel: "guild"
        });
    }

    public async exec(message: Message): Promise<Message | void> {
        const player = this.client.music.players.get(message.guild!.id);
        if (!player) return message.channel.send("There is no current song playing!");

        try {
            const { text } = await fetch.get(`https://lyrics-api.powercord.dev/lyrics?input=${player.queue.current!.title}`);
            const data = JSON.parse(text as string);
            if (data.total === 0) return message.channel.send(`Lyrics that you trying to search is doesn't exist!`);

            const chunked = this.chunk(data.data[0].lyrics, 2048);
            for (let i = 0; i < chunked.length; i++) {
                const Embed = new MessageEmbed()
                    .setColor(this.client.color)
                    .setTitle(data.data[0].name)
                    .setURL(data.data[0].url)
                    .setThumbnail(data.data[0].album_art)
                    .setDescription(chunked[i]);
                return message.channel.send(Embed);
            }
        } catch (err) {
            return message.channel.send(`Error while searching the lyrics: ${err.message}`);
        }
    }

    public chunk(array: string[], chunkSize: number) {
        const temp = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            temp.push(array.slice(i, i + chunkSize));
        }
        return temp;
    }
}
