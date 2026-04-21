import mongoose, { Schema, Document, Model } from "mongoose";

interface ICard {
  data: string;     
  updatedAt: Date;  
}

interface IUserGithubData {
	
}

interface IUser extends Document {
	githubId : string,
	accessToken : string,
	contributionsCard : ICard,
	languagesCard : ICard,
	userGithubData : IUserGithubData;
}

interface IUserModel extends Model<IUser> {
	findByGithubId(githubId: string): Promise<IUser | null>;
}

const userSchema: Schema<IUser> = new Schema({
	githubId: { type: String, required: true, unique: true },
	accessToken: { type: String, required: true },

	contributionsCard: {
		data: { type: String, default: "" },
		updatedAt: { type: Date, default: Date.now },
	},
	languagesCard: {
		data: { type: String, default: "" },
		updatedAt: { type: Date, default: Date.now },
	},
	userGithubData : {
		type : Schema.Types.Mixed,
		default : {}
	}
});

userSchema.statics.findByGithubId = function (githubId: string) {
	return this.findOne({ githubId });
};

const User: IUserModel = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;