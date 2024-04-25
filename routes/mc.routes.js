const router = require("express").Router();
const mailchimp = require("@mailchimp/mailchimp_marketing");

//SET MESSAGES TEXTS (these are responses sent to the frontend)
const dictionary = {
	en: {
		MSG_SUCCESS_SIGNUP : "Signed up successfully!",
		ERR_MSG_ALREADY_EXISTS : "Oops! You already signed up. Check your inbox.",
		ERR_MSG_CONNECTION : "Could not make a connection. Please try again."
	},
	nl: {
		MSG_SUCCESS_SIGNUP : "Succesvol aangemeld!",
		ERR_MSG_ALREADY_EXISTS : "Oeps! Je hebt je al aangemeld. Controleer je inbox.",
		ERR_MSG_CONNECTION : "Kon geen verbinding maken. Probeer aub opnieuw."
	}
}

// default language if nothing is set
const language = 'en';

const MC_LIST_ID = process.env.MAILCHIMP_LIST_ID;
const MC_SERVER = process.env.MAILCHIMP_SERVER;
const MC_API_KEY = process.env.MAILCHIMP_API_KEY;

mailchimp.setConfig({
  apiKey: MC_API_KEY,
  server: MC_SERVER,
});

/** Check if the connection to mailchimp via it's API is setup correctly */
const mc_ping = async (language) => {
  const response = await mailchimp.ping.get();
  if (response.health_status === "Everything's Chimpy!"){
	return 1;
  }
  else {
	console.error("Can not connect to Mailchimp. Maybe it's something with your Mailchimp API key?");
  	throw new Error(dictionary[language].ERR_MSG_CONNECTION);
  }
}

/** Search if the e-mail already exists in Mailchimp List
 * (resurns 0 if not or > 0 if yes) */
const mc_isInList = async (email) => {
	const response = await mailchimp.searchMembers.search(email);
	return (response.exact_matches.members.length);
}

// POST /mc/add-user
router.post("/add-user", async (req, res, next) => {
	console.log("REQbody: ", req.body);
	const newEmail = req.body.email;
	let language = 'en';
	if (req.body.language) {
		language = req.body.language;
	}

	try {
		//check mailchimp connection
		await mc_ping(language);
		//check if newMail already exists in the list
		//if it exists, respond with error ('already exists')
		if (await mc_isInList(newEmail)) {
			throw new Error(dictionary[language].ERR_MSG_ALREADY_EXISTS);
		}
		// If it does not exist
		// Save the mail to mailchimp list (API save member)
		const addMemberResponse = await mailchimp.lists.addListMember(MC_LIST_ID, {
			email_address: newEmail,
			status: "subscribed",
			tags: [req.body.language],
			// tags: ["Joined Waitlist", "Survey Opened"],
		});
		if (addMemberResponse.email_address === newEmail) {
			// RESPONSE TO FRONTEND with an "OK"
			res.status(200).json({'message': dictionary[language].MSG_SUCCESS_SIGNUP });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({"error":`${err}`});
	}
});

module.exports = router;