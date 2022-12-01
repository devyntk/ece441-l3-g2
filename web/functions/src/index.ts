import * as admin from 'firebase-admin';
import * as functions from "firebase-functions";
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

admin.initializeApp();
const db = getFirestore();
const colRef = db.collection('device-one');


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
    functions.logger.error('Error while verifying ID token', { token: idToken });
    response.status(403).send('Unauthorized');
    return;
  }

  if (request.body["uplink_message"] && request.body["uplink_message"]["decoded_payload"]) {
    functions.logger.log('Found Decoded Payload:', { payload: request.body["uplink_message"]["decoded_payload"] });
  } else {
    functions.logger.error('Error getting decoded payload', { payload: request.body })
    return
  }

  const val = request.body["uplink_message"]["decoded_payload"];
  colRef.add({
    temp: val['temperature_7'],
    hum: val['relative_humidity_8'],
    tvoc: val['temperature_9'],
    co2: val['temperature_10'],
    liquid: val['analog_in_5'],
    door: val['digital_in_6'],
    pir: val['digital_in_4'],
    opens: val['digital_in_11'],
    power_good: val['digital_in_2'],
    charging: val['digital_in_3'],
    water: val['digital_in_12'],
    timestamp: Timestamp.now()
  });

  response.status(200).send("Worked!");
});