import mongoose, { Schema, Document, Model } from "mongoose";
import { ContributionsInterface } from "../github/getContributionStats.js";
import { LanguagesInterface } from "../github/getLanguageStats.js";
import { encrypt } from "../utils/tokenCrypt.js";

interface IUserGithubData {
	contributionsStats: {
		data: ContributionsInterface;
		updatedAt: Date;
	} | null;

	languagesStats: {
		data: LanguagesInterface;
		updatedAt: Date;
	} | null;
}

interface IUserPortfolioData {
	introduction: string;
	techStack: string ;
	statsSection: string ;
	repoSection: string ;
	socialSection: string ;
};

export interface IUser extends Document {
	login: string;
	githubId: string;
	email: string | null;
	perms: "normal" | "elevated";
	accessToken: string;
	userGithubData: IUserGithubData;
	userPortfolioData: IUserPortfolioData;
}

interface IUserModel extends Model<IUser> {
	findByGithubId(githubId: string): Promise<IUser | null>;
	githubIdExists(githubId: string): Promise<IUser | null>;
}

const userSchema: Schema<IUser> = new Schema({
	login: {
		type: String,
		required: true,
		unique: true,
	},
	githubId: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: false,
		default: null,
	},

	perms: {
		type: String,
		enum: ["normal", "elevated"],
		default: "normal",
	},

	accessToken: {
		type: String,
		required: true,
	},

	userGithubData: {
		contributionsStats: {
			data: {
				type: Schema.Types.Mixed,
				default: null,
			},
			updatedAt: {
				type: Date,
				default: Date.now(),
			},
		},

		languagesStats: {
			data: {
				type: Schema.Types.Mixed,
				default: null,
			},
			updatedAt: {
				type: Date,
				default: Date.now(),
			},
		},
	},
	userPortfolioData: {
		introduction: {
			type: String,
			default: "",
		},
		techStack : {
			type : String,
			default : "",
		},
		statsSection : {
			type : String,
			default : "", 
		},
		repoSection : {
			type : String,
			default : "",
		},
		socialSection : {
			type : String,
			default : "",
		}
	}
});

userSchema.statics.findByGithubId = function (githubId: string) {
	return this.findOne({ githubId });
};

userSchema.statics.githubIdExists = function (githubId: string) {
	return this.findOne({ githubId });
};

userSchema.pre("save", async function () {
	if (this.isModified("accessToken")) {
		this.accessToken = encrypt(this.accessToken.trim());
	}
});

const User: IUserModel = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;