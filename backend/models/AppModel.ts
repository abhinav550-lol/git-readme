import mongoose, { Schema, Document, Model } from "mongoose";


interface IApp extends Document {
  userCount: number;
}

const appSchema: Schema<IApp> = new Schema({
  userCount: {
	type: Number,
	default: 0,
  },
});

const App: Model<IApp> = mongoose.model<IApp>("App", appSchema);

export default App;