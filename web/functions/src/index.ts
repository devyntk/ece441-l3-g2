import * as admin from 'firebase-admin';
import * as functions from "firebase-functions";

admin.initializeApp();

const TOKEN = "Jr0TCYhO3Nt7UpnYxEy3";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const inputTTN = functions.https.onRequest(async (request, response) => {

  const idToken = request.headers['x-ttn-token'];

  if (!idToken) {
    functions.logger.error(
      'No Authorization Header'
    );
    response.status(403).send('Unauthorized');
    return;
  }


  if (idToken == TOKEN) {
    functions.logger.log('ID Token correctly decoded');
  } else {
    functions.logger.error('Error while verifying ID token', {token: idToken});
    response.status(403).send('Unauthorized');
    return;
  }

  response.status(200).send("Worked!");
});