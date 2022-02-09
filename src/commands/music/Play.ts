import { Command } from "discord-akairo";
import { Message, MessageEmbed, Collection } from "discord.js";
import { LoadType, SearchResult } from "erela.js";

export default class PlayCommand extends Command {
    public constructor() {
        super("play", {
            aliases: ["play", "p"],
            category: "Music",
            ratelimit: 3,
            channel: "guild",
            args: [{
                id: "song",
                type: "string",
                match: "rest",
                prompt: {
                    modifyStart: (msg: Message) => `**${msg.author.tag}** | Please give me title or url!`,
                    modifyRetry: (msg: Message) => `**${msg.author.tag}** | Aagin?! Just send me title or url!`
                }
            }],
            clientPermissions: ["CONNECT", "SPEAK"]
        });
    }

    public async exec(message: Message, { song }: { song: string }): Promise<Message | void> {
        const { channel } = message.member!.voice;
        if (!channel) return message.channel.send("You need to join VoiceChannel first to play music!");

        const player = this.client.music.create({
            guild: message.guild!.id,
            voiceChannel: channel.id,
            textChannel: message.channel.id,
            selfDeafen: true
        });

        if (player.playing) {
            let res: LoadType | SearchResult | any;
            try {
                res = await player.search(song, message.author);
                if (res.loadType === "LOAD_FAILED") {
                    if (!player.queue.current) player.destroy();
                    throw new Error(res.exception);
                }
            } catch (err) {
                return message.channel.send(`Could't find: ${song}`);
            }

            switch (res.loadType) {
                case "NO_MATCHES":
                    if (!player.queue.current) player.destroy();
                    return message.channel.send(`Could't find: ${song}`);
                case "TRACK_LOADED":
                    player.queue.add(res.tracks[0]);
                    if (!player.playing as any && !player.paused && !player.queue.length) player.play();
                    return message.channel.send(`✅  **${res.tracks[0].title}** Added to queue!`);
                case "PLAYLIST_LOADED":
                    player.queue.add(res.tracks);
                    if (!player.playing as any && !player.paused && res.tracks.length) player.play();
                    return message.channel.send(`✅  **${res.playlist?.name}** Added to queue!`);
                case "SEARCH_RESULT":
                    const max = 10;
                    const filter = (m: Message) => m.author.id === message.author.id && /^(\d+|cancel|)$/i.test(m.content);
                    const result = res.tracks.slice(0, max).map((track: { title: any }, index: number) => `${index + 1} - ${track.title}`);
                    let collection: Collection<string, Message>;

                    const Embed = new MessageEmbed()
                        .setColor(this.client.color)
                        .setAuthor(`🎶 Resut for ${song} 🎶`, "https://cdn.discordapp.com/attachments/713193780932771891/759022257669406800/yt.png")
                        .setDescription(result)
                        .setFooter(`Reques by: ${message.author.tag} | type "cancel" for cancelling the selection`, message.author.displayAvatarURL());
                    const msg = await message.channel.send(Embed);

                    try {
                        collection = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });
                    } catch (err) {
                        if (!player.queue.current) player.destroy();
                        return message.reply("Come on, what are you doing?! oke i'll cancelling the selection...");
                    }

                    const first = collection.first()?.content;
                    if (first?.toLowerCase() === "cancel") {
                        msg.delete({ timeout: 2000 });
                        return message.channel.send("Cancelling the selection!");
                    }

                    const index = Number(first) - 1;
                    if (index < 0 || index > max - 1) return message.channel.send(`Please choice between (1-${max}`);

                    const track = res.tracks[index];
                    player.queue.add(track);
                    if (!player.playing as any && !player.paused && !player.queue.length) player.play();
                    return message.channel.send(`✅ **${track.title}** Added to queue!`);
            }
        }
        player.connect();

        let res: LoadType | SearchResult;
        try {
            res = await player.search(song, message.author);
            if (res.loadType === "LOAD_FAILED") {
                if (!player.queue.current) player.destroy();
                throw new Error(res.exception as any);
            }
        } catch (err) {
            return message.channel.send(`Could't find: ${song}`);
        }

        switch (res.loadType) {
            case "NO_MATCHES":
                if (!player.queue.current) player.destroy();
                return message.channel.send(`Could't find: ${song}`);
            case "TRACK_LOADED":
                player.queue.add(res.tracks[0]);
                if (!player.playing && !player.paused && !player.queue.length) player.play();
                return message.channel.send(`✅  **${res.tracks[0].title}** Added to queue!`);
            case "PLAYLIST_LOADED":
                player.queue.add(res.tracks);
                if (!player.playing && !player.paused && res.tracks.length) player.play();
                return message.channel.send(`✅  **${res.playlist?.name}** Added to queue!`);
            case "SEARCH_RESULT":
                const max = 10;
                const filter = (m: Message) => m.author.id === message.author.id && /^(\d+|cancel|)$/i.test(m.content);
                const result = res.tracks.slice(0, max).map((track, index) => `${index + 1} - ${track.title}`);
                let collection: Collection<string, Message>;

                const Embed = new MessageEmbed()
                    .setColor(this.client.color)
                    .setAuthor(`🎶 Resut for ${song} 🎶`, "https://cdn.discordapp.com/attachments/713193780932771891/759022257669406800/yt.png")
                    .setDescription(result)
                    .setFooter(`Reques by: ${message.author.tag} | type "cancel" for cancelling the selection`, message.author.displayAvatarURL());
                const msg = await message.channel.send(Embed);

                try {
                    collection = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });
                } catch (err) {
                    if (!player.queue.current) player.destroy();
                    return message.reply("Come on, what are you doing?! oke i'll cancelling the selection...");
                }

                const first = collection.first()?.content;
                if (first?.toLowerCase() === "cancel") {
                    msg.delete({ timeout: 2000 });
                    return message.channel.send("Cancelling the selection!");
                }

                const index = Number(first) - 1;
                if (index < 0 || index > max - 1) return message.channel.send(`Please choice between (1-${max}`);

                const track = res.tracks[index];
                player.queue.add(track);
                if (!player.playing && !player.paused && !player.queue.length) player.play();
                return message.channel.send(`✅ **${track.title}** Added to queue!`);
        }
    }
}
