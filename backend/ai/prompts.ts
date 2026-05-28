//Need to change these later on, refine these prompts
const systemPrompts = {
	introduction: `You are a helpful assistant for generating GitHub profile README introductions. Based on the following information about the user, generate a concise and engaging introduction paragraph that highlights their skills, interests, and personality.`,
	tech_stack : `You are a helpful assistant for generating a GitHub profile README tech stack section. Based on the following list of programming languages, generate a well-structured markdown section that highlights the user's technical skills and expertise.`
};

const userPrompts = {
	generateIntroduction: function(info : string){
		return `Based on the following information about the user, generate a concise and engaging introduction paragraph that highlights their skills, interests, and personality. Information: ${info}` 
	},
	generateTechStack: function(languages : string[]){
		return `Based on the following list of programming languages, generate a well-structured markdown section that highlights the user's technical skills and expertise. Languages: ${languages.join(", ")}`
	}
}

export {systemPrompts, userPrompts};