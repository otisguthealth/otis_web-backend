const router = require("express").Router();
const mailchimp = require("@mailchimp/mailchimp_marketing");

const MC_LIST_ID = process.env.MAILCHIMP_LIST_ID;
const MC_SERVER = process.env.MAILCHIMP_SERVER;
const MC_API_KEY = process.env.MAILCHIMP_API_KEY;

console.log('envs: ',MC_API_KEY, MC_LIST_ID, MC_SERVER);

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER,
});

/** Check if the connection to mailchimp via it's API is setup correctly */
const mc_ping = async () => {
  const response = await mailchimp.ping.get();
  if (response.health_status === "Everything's Chimpy!"){
  	// console.log(response);
	return 1;
  }
  else
  	throw new Error("Can not connect to Mailchimp.")
}

// DEPRECATED, gets only 10 and max of 1000 members. Using searchMembers.search() instead.
/** Retrieves list of users from Mailchimp and returns array of e-mail directions. */
/* const mc_getMembersList = async () => {
	const response = await mailchimp.lists.getListMembersInfo(MC_LIST_ID);
	if (response.members)
	{
		//console.log(response.members);
		console.log(response.members.map(object => object.email_address));
		return (response.members.map(object => object.email_address));
	}
	else
		throw new Error("The retrieved list has no members");	
	//console.log(response);
}; */

/** Search if the e-mail already exists in Mailchimp List
 * (resurns 0 if not or > 0 if yes) */
const mc_isInList = async (email) => {
	const response = await mailchimp.searchMembers.search(email);
	return (response.exact_matches.members.length);
}


const mc_addListMember = async (email) => {
	console.log('\tinside addMember');
  const response = await mailchimp.lists.addListMember(MC_LIST_ID, {
    email_address: email,
    status: "subscribed",
	// tags: ["Joined Waitlist", "Survey Opened"],
  });
  return response;
  // console.log(response);
};

router.post("/add-user", async (req, res, next) => {
	const newEmail = req.body.email;
	console.log('emal argument is: ', newEmail);
	try {
		//check mailchimp connection
		console.log('starting PING');
		await mc_ping();
		console.log('ping OK');
		
		//check if newMail already exists in the list
		//if it exists, respond with error ('already exists')
		if (await mc_isInList(newEmail)) {
			console.log('already exists');
			throw new Error("User with this e-mail already exist.");
		}
		console.log('email is unique OK');
		// If it does not exist
			// Save the mail to mailchimp list (API save member)
		console.log(`calling addListMember`);
		const addMemberResponse = await mailchimp.lists.addListMember(MC_LIST_ID, {
			email_address: newEmail,
			status: "subscribed",
			// tags: ["Joined Waitlist", "Survey Opened"],
		});
		console.log(999);
		console.log(`addListMember response: `, addMemberResponse.email_address);
		if (addMemberResponse.email_address === newEmail) {
			//RESPONSE TO FRONTEND
			res.json({'message':`received email: ${newEmail}`});
		}
		console.log(newEmail, ' saved to MC list');
			// respond to frontend with an OK and frontend shows typeform survey
	} catch (err) {
		console.error(err);
		res.status(500).send({"error":`${err}`});
	}
});

module.exports = router;