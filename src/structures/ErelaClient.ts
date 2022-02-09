import { client } from "..";
import { Manager } from "erela.js";
import ErelaSpotify from "erela.js-spotify";
import { TextChannel } from "discord.js";
import { LAVA_IP, LAVA_PASS, LAVA_PORT, clientID, clientSecret } from "../config";

export default class Erela {
    public constructor() {

    }

    async connect(): Promise<void> {
        client.music = new Manager({
            nodes: [{
                host: LAVA_IP,
                port: LAVA_PORT,
                password: LAVA_PASS
            }],
            autoPlay: true,
            plugins: [
                new ErelaSpotify({
                    clientID,
                    clientSecret
                })
            ],
            send: (id, payload) => {
                const guild = client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            }
        })
            .on("nodeConnect", node => client.logger.info(`[ ERELA CONNCTED ] Connected to ${node.options.host}:${node.options.port}`))
            .on("nodeError", (node, err) => client.logger.info(`[ ERELA ERROR ] ${node.options.host}:${node.options.port} have some trouble ( ${err.message} )`))
            .on("nodeDisconnect", player => player.destroy())
            .on("trackStart", (player, track) => {
                const channel = client.channels.cache.get(player.textChannel as string) as TextChannel;
                channel.send(`Now playing: ${track.title}`);
            })
            .on("queueEnd", player => {
                const channel = client.channels.cache.get(player.textChannel as string) as TextChannel;
                channel.send(`Queue is empty...`);
            });
    }
}
