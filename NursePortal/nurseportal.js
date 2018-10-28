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

        var table = document.getElementById('Nurse-Table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadrow = document.createElement('tr');
        var theader1 = document.createElement('th');
        var theader2 = document.createElement('th');

        theader1.innerHTML = "Name";
        theader2.innerHTML = "Status";

        theadrow.appendChild(theader1);
        theadrow.appendChild(theader2);

        thead.appendChild(theadrow);
        table.appendChild(thead);

        nurses.forEach(function (nurse) {
            var status = "";

            var tr = document.createElement('tr');
            tr.id = "nurse-row";

            var td1 = document.createElement('td');
            td1.id = "nurse-name";
            td1.innerHTML = nurse.FirstName + " " + nurse.LastName;

            var link = document.createElement('a');
            link.setAttribute('href', 'patientlisting.php');

            var td2 = document.createElement('td');

            var editbtn = document.createElement('button');
            editbtn.setAttribute("id", "manage-nurse");
            editbtn.innerHTML = "Manage";
            editbtn.className = "btn btn-primary mx-2";
            editbtn.addEventListener('click', function () {
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

            td2.appendChild(editbtn);

            var btn = document.createElement('button');
            btn.setAttribute("id", "change-status");
            btn.addEventListener('click', function () {
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
                status = "On Call";
                btn.className = "btn btn-purple";
            } else {
                status = "Off Call";
                btn.className = "btn btn-purple btn-outline-purple";
            }
            btn.setAttribute('type', 'button');
            btn.innerHTML = status;


            td2.appendChild(btn);

            tr.appendChild(td1);
            tr.appendChild(td2);

            tbody.appendChild(tr);

        });

        table.appendChild(tbody);

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


