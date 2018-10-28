var firebaseAPP;
var currentFirebaseAppUser;
var currentAppUser;

function updateStatus(nurseID, isOnCall) {

    var db = firebase.database().ref().child('Nurses');
    db.child(nurseID).child('isOnCall').set(isOnCall);

}


function createNurse(first, last, team, facetime, hangout) {
    var db = firebase.database().ref().child('Nurses');
    var id = db.push().key;

    var nurse = {
        FirstName: first,
        LastName: last,
        Team: team,
        FacetimeID: facetime,
        HangoutID: hangout,
        isOnCall: false
    };

    db.child(id).set(nurse);
    location.reload();
}

function getNurseDetails() {
    var first = document.getElementById('n-first-name').value;
    var last = document.getElementById('n-last-name').value;
    var facetime = document.getElementById('n-facetime').value;
    var hangout = document.getElementById('n-hangout').value;

    var dropdown = document.getElementById('team-select');
    var team = dropdown.options[dropdown.selectedIndex].text;

    return [first, last, team, facetime, hangout];
}

function SortByName(a, b){
  var aName = a.FirstName.toLowerCase();
  var bName = b.FirstName.toLowerCase();
  return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}


function removePatientFromNurse(nurse, patientID) {
    var db = firebase.database().ref().child('Nurses').child(nurse).child("Patients").child(patientID).set(false);
    unassignNurseFromPatient(nurse, patientID);
    location.reload();
}

function unassignNurseFromPatient(nurseID, patientID) {
    var db = firebase.database().ref().child('Patients').child(patientID).child("PrimaryNurseID").set(null);
}

function assignPatientToNurse(pid) {
    var nurse = JSON.parse(localStorage.getItem("selectedNurse"));

    var db = firebase.database().ref();
    db.child('Patients').child(pid).child("PrimaryNurseID").set(nurse.ID);
    db.child('Nurses').child(nurse.ID).child("Patients").child(pid).set(true);

    location.reload();
}
