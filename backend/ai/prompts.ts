//Need to change these later on, refine these prompts
const systemPrompts = {
	introduction: `You are a helpful assistant for generating GitHub profile README introductions. Based on the following information about the user, generate a concise and engaging introduction paragraph that highlights their skills, interests, and personality.`,
	tech_stack : `You are a helpful assistant for generating a GitHub profile README tech stack section. Based on the following list of programming languages, generate a well-structured markdown section that highlights the user's technical skills and expertise.`,
	repo : `You are a helpful assistant for generating a GitHub profile README repository section. Based on the following repository information, generate a well-structured markdown section that highlights the user's projects and contributions.`
};

const userPrompts = {
	generateIntroduction: function(info : string){
		return `Based on the following information about the user, generate a concise and engaging introduction paragraph that highlights their skills, interests, and personality. Information: ${info}` 
	},
	generateTechStack: function(languages : string[]){
		return `Based on the following list of programming languages, generate a well-structured markdown section that highlights the user's technical skills and expertise. Languages: ${languages.join(", ")}`
	},
	generateRepo : function(repoSection : {name : string , description : string , readmeContent : string , html_url : string}[]){
		return `Based on the following repository information, generate a well-structured markdown section that highlights the user's projects and contributions. Repositories: ${repoSection.map(repo => `- [${repo.name}](${repo.html_url}) - ${repo.description}`).join("\n")}`
	}
}

export {systemPrompts, userPrompts};