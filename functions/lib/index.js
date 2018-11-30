"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const messaging = admin.messaging();
const manager = "manager";
const crusher = "crusher";
const tambang = "tambang";
exports.tripCreated = functions.firestore.document('trip/{tripId}').onCreate((snap, context) => {
    const data = snap.data();
    const destination = data.destination;
    const number = data.number;
    // checking the destinatin (vehicle and notification)
    let topic = "";
    let messageBody = '';
    let depTime;
    if (destination === crusher) {
        topic = crusher;
        depTime = data.mineDeparture;
        const volume = data.volume;
        messageBody = number
            + ' berangkat dari tambang ke '
            + destination
            + ' pada pukul: '
            + depTime
            + ' dengan volume : '
            + volume
            + ' kubik';
    }
    else if (destination === tambang) {
        topic = tambang;
        depTime = data.crusherDeparture;
        messageBody = number + ' berangkat dari crusher ke ' + destination + ' pada pukul: ' + depTime;
    }
    const msg = {
        notification: {
            title: 'Kendaraan berangkat',
            body: messageBody
        },
        topic: topic
    };
    messaging.send(msg)
        .then(response => {
        console.log('succesfully sent: ', response);
    }).catch(err => {
        console.log('error: ', err);
    });
    return null;
});
exports.tripUpdated = functions.firestore.document('trip/{tripId}').onUpdate((change, context) => {
    const dataAfterChange = change.after.data();
    const destination = dataAfterChange.destination;
    const number = dataAfterChange.number;
    let topic = "";
    let messageBody = '';
    let arrTime;
    if (destination === crusher) {
        topic = tambang;
        arrTime = dataAfterChange.crusherArrival;
        const volume = dataAfterChange.volume;
        messageBody = number
            + ' sampai di '
            + destination
            + ' pada pukul: '
            + arrTime
            + ' dengan volume : '
            + volume
            + ' kubik';
    }
    else if (destination === tambang) {
        topic = crusher;
        arrTime = dataAfterChange.mineArrival;
        messageBody = number
            + ' sampai di '
            + destination
            + ' pada pukul: '
            + arrTime;
    }
    const msg = {
        notification: {
            title: 'Kendaraan sampai',
            body: messageBody
        },
        topic: topic
    };
    messaging.send(msg)
        .then(response => {
        console.log('succesfully sent: ', response);
    }).catch(err => {
        console.log('error: ', err);
    });
    return null;
});
exports.grantRole = functions.auth.user().onCreate((data, context) => {
    const email = data.email;
    const uid = data.uid;
    const isContainManager = email.includes(manager);
    const isContainCrusher = email.includes(crusher);
    const isContainTambang = email.includes(tambang);
    const roles = {
        manager: isContainManager,
        tambang: isContainTambang,
        crusher: isContainCrusher
    };
    admin.auth().setCustomUserClaims(uid, roles)
        .then(response => {
        console.log(email + ' is granted this roles: ', roles);
        console.log('response: ', response);
    }).catch(err => {
        console.log('error: ', err);
    });
});
//# sourceMappingURL=index.js.map