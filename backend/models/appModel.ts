import mongoose, { Schema, Document, Model } from "mongoose";


interface IApp extends Document {
  userCount: number;
  appId : number;
}

const appSchema: Schema<IApp> = new Schema({
  userCount: { //will be incremented when profile creation is successful
	type: Number,
	default: 0,
  },
  appId : {
	type : Number,
	unique : true,
	required : true,
  }
});

export const incrementUserCount = async (appId: number) => {
	await App.findOneAndUpdate(
		{ appId: appId },
	{
		$inc: { userCount: 1 },
		$setOnInsert: { appId: 1440 },
	},
	{
		upsert: true,
		new: true,
	}
	);
}

const App: Model<IApp> = mongoose.model<IApp>("App", appSchema);

export default App;