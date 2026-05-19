import mongoose, { Schema, Document, Model } from "mongoose";
import { ContributionsInterface } from "../github/getContributionStats.js";
import { LanguagesInterface } from "../github/getLanguageStats.js";
import { encrypt } from "../utils/tokenCrypt.js";

interface IUserGithubData {
	contributionsStats : {data : ContributionsInterface , updatedAt: Date} | null,
	languagesStats :{data : LanguagesInterface , updatedAt: Date} | null
};

export interface IUser extends Document {
	githubId : string;
	email : string | null;
	perms : "normal" | "elevated";
	accessToken : string;
	userGithubData : IUserGithubData;
	getCachedGithubContributionStats(githubId : string) : Promise<IUser | null>;
	getCachedGithubLanguageStats(githubId : string) : Promise<IUser | null>;
}

interface IUserModel extends Model<IUser> {
	findByGithubId(githubId: string): Promise<IUser | null>;
	githubIdExists(githubId: string): Promise<IUser | null>;
}

const userSchema: Schema<IUser> = new Schema({
	githubId: { type: String, required: true, unique: true },
	email : { type: String, required: false },
	perms: { type: String, enum: ["normal", "elevated"], default: "normal" },
	accessToken: { type: String, required: true },
	userGithubData : {	
		type : Schema.Types.Mixed,
		default : {}
	}
});

userSchema.statics.findByGithubId = function (githubId: string) {
	return this.findOne({ githubId });
};

userSchema.statics.githubIdExists = function (githubId: string) {
	return this.findOne({ githubId });
};

userSchema.pre("save" , async function(){
	if(this.isModified("accessToken")){
		this.accessToken = encrypt(this.accessToken.trim());
	}
});

userSchema.index({ githubId: 1 });

const User: IUserModel = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;