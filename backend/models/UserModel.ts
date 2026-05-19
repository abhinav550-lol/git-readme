import mongoose, { Schema, Document, Model } from "mongoose";
import { ContributionsInterface } from "../github/getContributionStats.js";
import { LanguagesInterface } from "../github/getLanguageStats.js";
import { encrypt } from "../utils/tokenCrypt.js";

interface IUserGithubData {
  contributionsStats: {
    data: ContributionsInterface;
    updatedAt: number;
  } | null;

  languagesStats: {
    data: LanguagesInterface;
    updatedAt: number;
  } | null;
}

export interface IUser extends Document {
  githubId: string;
  email: string | null;
  perms: "normal" | "elevated";
  accessToken: string;
  userGithubData: IUserGithubData;
}

interface IUserModel extends Model<IUser> {
  findByGithubId(githubId: string): Promise<IUser | null>;
  githubIdExists(githubId: string): Promise<IUser | null>;
}

const userSchema: Schema<IUser> = new Schema({
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
        type: Schema.Types.Number,
        default: null,
      },
    },

    languagesStats: {
      data: {
        type: Schema.Types.Mixed,
        default: null,
      },
      updatedAt: {
        type: Schema.Types.Number,
        default: null,
      },
    },
  },
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