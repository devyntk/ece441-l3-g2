import * as admin from 'firebase-admin';
import * as functions from "firebase-functions";

admin.initializeApp();

const TOKEN = "Jr0TCYhO3Nt7UpnYxEy3";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const inputTTN = functions.https.onRequest(async (request, response) => {
  if (!request.headers.authorization ) {
    functions.logger.error(
      'No Authorization Header'
    );
    response.status(403).send('Unauthorized');
    return;
  }

  const idToken = request.headers.authorization;

  if (idToken == TOKEN) {
    functions.logger.log('ID Token correctly decoded');
  } else {
    functions.logger.error('Error while verifying ID token');
    response.status(403).send('Unauthorized');
    return;
  }

});