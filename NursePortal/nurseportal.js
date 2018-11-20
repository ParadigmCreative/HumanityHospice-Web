var nurses = [];
var selectedNurse;


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

    firebase.auth().onAuthStateChanged(function (user) {
        if (user == null) {
            location.href = "http://connect.humanityhospice.com";
        } else {
            if (user.uid != "pJR6aIo5o4WpnLlVXe7ZkwPDsl33") {
                firebase.auth().signOut().then(function () {
                    location.href = "http://connect.humanityhospice.com";
                }).catch(function (error) {
                    location.href = "http://connect.humanityhospice.com";
                });
            }
        }
    });

    var db = firebase.database().ref().child('Nurses');
    db.once('value').then(function (snap) {

        nurses = [];
        $("#Nurse-Table").empty();

        snap.forEach(function (user) {
            var userData = user.val();

            var newNurse = {
                ID: user.key,
                FirstName: userData.FirstName,
                LastName: userData.LastName,
                Team: userData.Team,
                FacetimeID: userData.FacetimeID,
                HangoutID: userData.HangoutID,
                OnCall: userData.isOnCall,
                Patients: userData.Patients
            };

            if (nurses.includes(newNurse)) {
                console.log("Already contains nurse");
            } else {
                nurses.push(newNurse);
            }

        });

        var edmond = document.getElementById('edmond-team');
        var perry = document.getElementById('perry-team');
        

        nurses.forEach(function (nurse) {
            var tr = document.createElement('tr');
            tr.id = "nurse-row";

            var mKey = "manage-nurse" + nurse.ID;
            var cKey = "change-nurse" + nurse.ID;

            var template = `
                <td width="40%" id="nurse-name">${nurse.FirstName + " " + nurse.LastName}</td>
                <td>
                    <button id="${mKey}" class="btn btn-primary mx-2">Manage</button>
                    <button id="${cKey}" class="btn btn-purple" type="button">On Call</button>
                </td>
            `
            tr.innerHTML = template;

            if (nurse.Team == "Perry") {
                perry.appendChild(tr);
            } else {
                edmond.appendChild(tr);
            }

            var manage = document.getElementById(mKey);
            var change = document.getElementById(cKey);

            manage.addEventListener('click', function() {
                var row = $(this).closest('tr#nurse-row');
                var data = row.find("td#nurse-name");
                var name = data.text();

                var foundNurse = nurses.find(function (nurse) {
                    return (nurse.FirstName + " " + nurse.LastName) == name;
                });

                selectedNurse = foundNurse;
                localStorage.setItem("selectedNurse", JSON.stringify(foundNurse));

                window.location.href = "patientlisting.html";
            });

            change.addEventListener('click', function() {
                $(this).toggleClass("btn-outline-purple");

                var trow = $(this).closest('tr');
                var data = trow.find('td#nurse-name');
                var name = data.text();

                var foundNurse = nurses.find(function (nurse) {
                    return (nurse.FirstName + " " + nurse.LastName) == name;
                });

                var text = $(this).text();

                if (text == "Off Call") {
                    $(this).text("On Call");
                    updateStatus(foundNurse.ID, true);
                } else {
                    $(this).text("Off Call");
                    updateStatus(foundNurse.ID, false);
                }
            });

            if (nurse.OnCall) {
                change.innerHTML = "On Call";
                change.className = "btn btn-purple";
            } else {
                change.innerHTML = "Off Call";
                change.className = "btn btn-purple btn-outline-purple";
            }

        });

    });




    $("#signout").click(function () {
        firebase.auth().signOut().then(function () {
            // Sign-out successful.
            location.href = "../LoginSignup/index.html";
        }).catch(function (error) {
            console.log(error.message);
        });
    });

    $("#submit-create-nurse").click(function () {
        var n = getNurseDetails();
        createNurse(n[0], n[1], n[2], n[3], n[4]);
    });




}());



function findNurse(parent) {
    var data = parent.find('td#nurse-name');
    var name = data.text();

    var foundNurse = nurses.find(function (nurse) {
        return (nurse.FirstName + " " + nurse.LastName) == name;
    });

    return foundNurse;
}


