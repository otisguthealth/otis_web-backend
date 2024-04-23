const router = require("express").Router();
const mailchimp = require("@mailchimp/mailchimp_marketing");

//SET MESSAGES TEXTS (these are responses sent to the frontend)
const ERR_MSG_ALREADY_EXISTS = "Oops! You already signed up. Check your inbox."
const ERR_MSG_MAILCHIMP_CONNECTION = "Can not connect to Mailchimp.";
const MSG_SUCCESS_SIGNUP = "Signed up successfully!";

const MC_LIST_ID = process.env.MAILCHIMP_LIST_ID;
const MC_SERVER = process.env.MAILCHIMP_SERVER;
const MC_API_KEY = process.env.MAILCHIMP_API_KEY;

mailchimp.setConfig({
  apiKey: MC_API_KEY,
  server: MC_SERVER,
});

/** Check if the connection to mailchimp via it's API is setup correctly */
const mc_ping = async () => {
  const response = await mailchimp.ping.get();
  if (response.health_status === "Everything's Chimpy!"){
	return 1;
  }
  else
  	throw new Error(ERR_MSG_MAILCHIMP_CONNECTION);
}

/** Search if the e-mail already exists in Mailchimp List
 * (resurns 0 if not or > 0 if yes) */
const mc_isInList = async (email) => {
	const response = await mailchimp.searchMembers.search(email);
	return (response.exact_matches.members.length);
}

// POST /mc/add-user
router.post("/add-user", async (req, res, next) => {
	const newEmail = req.body.email;
	try {
		//check mailchimp connection
		await mc_ping();
		//check if newMail already exists in the list
		//if it exists, respond with error ('already exists')
		if (await mc_isInList(newEmail)) {
			throw new Error(ERR_MSG_ALREADY_EXISTS);
		}
		// If it does not exist
		// Save the mail to mailchimp list (API save member)
		const addMemberResponse = await mailchimp.lists.addListMember(MC_LIST_ID, {
			email_address: newEmail,
			status: "subscribed",
			// tags: ["Joined Waitlist", "Survey Opened"],
		});
		if (addMemberResponse.email_address === newEmail) {
			// RESPONSE TO FRONTEND with an "OK"
			res.status(200).json({'message': MSG_SUCCESS_SIGNUP });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({"error":`${err}`});
	}
});

module.exports = router;