class appError extends Error{
	status : number
	constructor(status : number , message : string){
		super(message)	
		this.status = status	
		this.name = "appError"

		Object.setPrototypeOf(this, appError.prototype);
	}
}


export default appError