import { client } from "..";
import { connect, set, connection } from "mongoose";

export default class MongoDB {
    async dbConnect(): Promise<void> {
        const option: Record<string, boolean> = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        };

        connect(process.env.MONGODB as string, option);
        set("useFindAndModify", false);

        connection.on("connected", () => {
            client.logger.info(`[ MONGODB ] Successfully Connected to MongoDB`);
        })
            .on("err", err => {
                client.logger.info(`[ MONGODB ERROR ] Got some errors here:\n${err.stack}`);
            })
            .on("disconnected", () => {
                client.logger.info(`[ MONGODB DISCONNECTED ] MongoDB Got Disconnected from the Cluster !!!`);
            });
    }
}
