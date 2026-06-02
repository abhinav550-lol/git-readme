import cron from "node-cron";
import User from "../models/userModel.js";

const DEFAULT_CUTOFF = 6 * 60 * 60 * 1000;
cron.schedule("0 0 * * *", async () => {
  const cutoff = new Date(Date.now() - DEFAULT_CUTOFF);

  const result = await User.updateMany(
    {
      "userPortfolioData.lastEdited": { $lt: cutoff },
    },
    {
      $unset: {
        "userPortfolioData.introduction": "",
        "userPortfolioData.techStack": "",
        "userPortfolioData.statsSection": "",
        "userPortfolioData.repoSection": "",
        "userPortfolioData.socialSection": "",
        "userPortfolioData.lastEdited": "",
      },
    }
  );
  
  console.log(`Cleaned ${result.modifiedCount} old README drafts at ${new Date().toISOString()}`);
});