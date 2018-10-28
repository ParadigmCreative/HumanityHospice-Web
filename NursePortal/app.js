
var nurses = [];
var selectedNurse;


(function() {

//    var nurses = [];

    var nameObj = document.getElementById('nurse-name');

    var db = firebase.database().ref().child('Nurses');
    db.once('value').then(function(snap) {

        nurses = [];
        $("#Nurse-Table").empty();

        snap.forEach(function(user) {
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

        nurses.forEach(function(nurse) {
            var status = "";

            var table = document.getElementById('Nurse-Table');
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
            editbtn.addEventListener('click', function() {
                var row = $(this).closest('tr#nurse-row');
                var data = row.find("td#nurse-name");
                var name = data.text();

                var foundNurse = nurses.find(function(nurse) {
                  return (nurse.FirstName + " " + nurse.LastName) == name;
                });

                selectedNurse = foundNurse;
                localStorage.setItem("selectedNurse", JSON.stringify(foundNurse));

                window.location.href = "patientlisting.html";

            });

            td2.appendChild(editbtn);

            var btn = document.createElement('button');
            btn.setAttribute("id", "change-status");
            btn.addEventListener('click', function() {
               $(this).toggleClass("btn-outline-purple");

                var trow = $(this).closest('tr');
                var data = trow.find('td#nurse-name');
                var name = data.text();

                var foundNurse = nurses.find(function(nurse) {
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

            table.appendChild(tr);

        });

    });



}());


function findNurse(parent) {
    var data = parent.find('td#nurse-name');
    var name = data.text();

    var foundNurse = nurses.find(function(nurse) {
      return (nurse.FirstName + " " + nurse.LastName) == name;
    });

    return foundNurse;
}
