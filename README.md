# Otisguthealth - Backend

RESTful API server created in NodeJS, Express and Javascript.
deployed on https://otis-server.adaptable.app

(for frontend documentation, **[SEE FRONTEND README](https://github.com/otisguthealth/otis_web-frontend)**)

## How to use:
### Development
(this project is using NodeJS with Express as the development environment).
- if you have just cloned the git repository to your local machine, don't forget to run `npm install` command first.
- it's important to set up the environment variables by creating the `.env` file in the projects' root folder so you don't disclose the sensitive API keys etc. to the public.
	- for security, .env file is never part of a the git repository
	- when deploying the enviroment variables are set upo in the adaptable service settings in the app -> settings tab -> scroll down to runtime environment and create as many variables as needed, one line per variable.
	```
	MAILCHIMP_API_KEY=....
	MAILCHIMP_SERVER=....
	MAILCHIMP_LIST_ID=.....
	ORIGIN=.....
	PORT=5005
 	```
	the `.......` have to be the actual values.
  	while developing, you can run frontend and backend on your local machine and set the `ORIGIN` to the local frontend URL (probably `http://localhost:5173`)

- run the command `npm run dev` in the root folder and the server will start. You will get a localhost URL to access where you can make API calls. The URL will be probably this: `http://localhost:5005`

- You can set Messages sent to frontend in the `routes/mc.routes.js` file

	```Javascript
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
	```

## Deployment

The project is deployed at [Adaptable](https://adaptable.io/).
- The [github repository](https://github.com/otisguthealth/otis_web-backend) is linked to the Adaptable service and on every change to the main branch, live version gets updated.


## Troubleshooting
- Is the server running? If you try to call the server at the base url and add `/api` (for localhost the example would be `http://localhost:5173/api`, for the live server it would be `https:// ..... .adaptable.app/api`) , you should see `"All good in here"` message. You can use web browser to do this.
- Check servers' status on Adaptable https://adaptable.io/app/dashboard
- You can check error logs in the Adaptable `dashboard -> Resources` tab. In the `Containers` section, on the very right there is `view Logs` button. Does this information directs you to identify the error? Maybe it has something to do with Mailchimp or Typeform.
- In these cases, check Mailchimps' or Typeforms' dashboards.
