import { model, Schema, Model, Document } from "mongoose";

interface InviteTrackerInterface extends Document {
    serverId: string;
    inviteTrack: any;
    WelcomeMessageId: string;
    GoodByeMessageId: string;
    WelcomeChannelId: string;
    GoodByeChannelId: string;
}

const InviteTrackSchema: Schema = new Schema({
    serverId: String,
    WelcomeChannelId: String,
    GoodByeChannelId: String,
    WelcomeMessageId: { type: String, default: "**{member}** is joined the server using **{target}** invitation" },
    GoodByeMessageId: { type: String, default: "**{member}** leave the server using **{target}** invitation" },
    inviteTrack: { type: Object, default: {} }
});

export const InviteTrack: Model<InviteTrackerInterface> = model("invite_track", InviteTrackSchema);
