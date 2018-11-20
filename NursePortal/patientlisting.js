


(function(){

    if (!firebase.apps.length) {
        var config = {
            apiKey: "AIzaSyAwIcQm5O23O87FXYTa8jkPPeOlu9HRJCM",
            authDomain: "humanityhospice-9ce45.firebaseapp.com",
            databaseURL: "https://humanityhospice-9ce45.firebaseio.com",
            projectId: "humanityhospice-9ce45",
            storageBucket: "humanityhospice-9ce45.appspot.com",
            messagingSenderId: "669612038928"
        };

        firebase.initializeApp(config);
    }

    var nurseObj = localStorage.getItem("selectedNurse");
    var nurse = JSON.parse(nurseObj);
    $("#nurse-name").text(nurse.FirstName + " " + nurse.LastName);
    $("#nurse-facetime").text(nurse.FacetimeID);
    $("#nurse-hangout").text(nurse.HangoutID);
    $("#nurse-team").text(nurse.Team);

    $("#n-first-name-update").val(nurse.FirstName);
    $("#n-last-name-update").val(nurse.LastName);
    $("#n-facetime-update").val(nurse.FacetimeID);
    $("#n-hangout-update").val(nurse.HangoutID);
    $("#n-team-select-update").val(nurse.Team);

    listenForUpdates(nurse.ID);

    getPatientList();
    getAllPatientsInCurrentTeam();

    document.getElementById("submit-assign-patient").addEventListener('click', function () {
        var dropdown = document.getElementById("patient-select");
        var name = dropdown.options[dropdown.selectedIndex].text;

        var patient = patientsInTeam.find(function (patient) {
            return patient.FullName == name;
        });

        assignPatientToNurse(patient.ID);


    });

    document.getElementById("submit-update-nurse").addEventListener('click', function() {
        var first = $("#n-last-name-update").val();
        var last = $("#n-first-name-update").val();
        var facetime = $("#n-facetime-update").val();
        var gmail = $("#n-hangout-update").val();
        var team = $("#n-team-select-update").find(":selected").text();
        udpateNurseData(first, last, facetime, gmail, team, nurse.ID);
    });

    document.getElementById('submit-delete-nurse').addEventListener('click', function() {
        var db = firebase.database().ref();
        db.child('Nurses').child(nurse.ID).set(null);
        location.href = "nurseportal.html";
    });


}());

var patients = [];
function getPatientList() {
    var nurseobj = localStorage.getItem("selectedNurse");
    var nurse = JSON.parse(nurseobj);

    var db = firebase.database().ref().child('Patients');

    db.orderByChild('PrimaryNurseID').equalTo(nurse.ID).once('value').then(function (newPatients) {

        newPatients.forEach(function (patientObj) {
            var patient = patientObj.val();

            var newPatient = {
                ID: patientObj.key,
                FirstName: patient.FirstName,
                LastName: patient.LastName,
                FullName: patient.FullName,
                Team: patient.Team,
                PrimaryNurseID: patient.PrimaryNurseID
            }

            patients.push(newPatient);
        });

        setupPatientList();

    });
}

function setupPatientList() {
    var nurseobj = localStorage.getItem("selectedNurse");
    var nurse = JSON.parse(nurseobj);

    var table = document.getElementById('patient-list');


    patients.forEach(function (patient) {
        var tr = document.createElement('tr');
        tr.id = "patient-row";

        var td1 = document.createElement('td');
        var pName = document.createElement('p');
        pName.innerHTML = patient.FullName;

        td1.appendChild(pName);

        var td2 = document.createElement('td');
        var deleteButton = document.createElement('button');
        deleteButton.className = "btn btn-outline-danger";
        deleteButton.addEventListener('click', function () {
            removePatientFromNurse(nurse.ID, patient.ID);
        });

        deleteButton.innerHTML = "Unassign Patient";

        td2.appendChild(deleteButton);

        tr.appendChild(td1);
        tr.appendChild(td2);

        table.appendChild(tr);


    });
}

var patientsInTeam = [];
function getAllPatientsInCurrentTeam() {
    var nurseobj = localStorage.getItem("selectedNurse");
    var nurse = JSON.parse(nurseobj);

    var team = nurse.Team;

    var db = firebase.database().ref().child('Patients');

    db.once('value').then(function (filteredPatients) {
        filteredPatients.forEach(function (pat) {
            var key = pat.key;
            var newPatient = {
                ID: key,
                FirstName: pat.val().FirstName,
                LastName: pat.val().LastName,
                FullName: pat.val().FullName,
                Team: pat.val().Team,
                PrimaryNurseID: pat.val().PrimaryNurseID
            }

            patientsInTeam.push(newPatient);

        });
        setupCurrentPatientTeam();
    });

}

function setupCurrentPatientTeam() {

    var select = document.getElementById('patient-select');

    patientsInTeam.forEach(function (item) {
        var option = document.createElement('option');
        option.text = item.FullName;
        select.add(option);
    });

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

function SortByName(a, b) {
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

function udpateNurseData(first, last, facetime, hangouts, team, nid) {
    var nurseData = {
        FirstName: first,
        LastName: last,
        FacetimeID: facetime,
        HangoutID: hangouts,
        Team: team
    };
    
    var db = firebase.database().ref();
    db.child('Nurses').child(nid).update(nurseData);
}

function listenForUpdates(nid) {
    var db = firebase.database().ref();
    var updates = db.child('Nurses').child(nid).on('value', function (data) {
        var nurseData = data.val();
        $("#nurse-name").text(nurseData.FirstName + " " + nurseData.LastName);
        $("#nurse-facetime").text(nurseData.FacetimeID);
        $("#nurse-hangout").text(nurseData.HangoutID);
        $("#nurse-team").text(nurseData.Team);
    });
}