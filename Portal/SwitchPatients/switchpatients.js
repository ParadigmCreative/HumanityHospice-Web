var ReadingFrom;

(function () {

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
        if (user != null) {

            var signup = document.getElementById('followPatient');
            signup.addEventListener('click', function () {

                var patientcodebox = document.getElementById('patientCode');
                var patientcode = patientcodebox.value;

                if (patientcode != "") {
                    var spinner = $('#spinner');
                    spinner.toggleClass('loader');

                    var invites = firebase.database().ref().child('InviteCodes');
                    invites.child(patientcode).once('value').then(function (snap) {
                        var exists = snap.val();
                        if (exists) {
                            var patientID = snap.val();
                            var id = patientID.Patient;

                            firebase.database().ref().child("Readers").child(user.uid).child("PatientList").child(id).set(true);
                            firebase.database().ref().child("Readers").child(user.uid).child("ReadingFrom").set(id);
                            firebase.database().ref().child("Patients").child(id).child("Readers").child(user.uid).set(true);

                            spinner.toggleClass('loader');

                            location.href = "../Journal/journal.html";

                        } else {
                            if ($("#patientCode").hasClass('is-invalid')) {
                                $('#invalid-text').text("Invalid Invite Code");
                                spinner.toggleClass('loader');
                            } else {
                                $("#patientCode").toggleClass('is-invalid');
                                $('#invalid-text').text("Invalid Invite Code");
                                spinner.toggleClass('loader');
                            }
                        }
                    });
                } else {
                    var code = $("#patientCode");
                    code.toggleClass('is-invalid');
                }

            });
        
            firebase.database().ref().child("Readers").child(user.uid).once('value').then(function (snap) {
                var userdata = snap.val();
                var fbuser = {
                    FullName: userdata.FullName,
                    ReadingFrom: userdata.ReadingFrom,
                    UID: user.uid
                };

                firebaseReader = fbuser;
                currentAppUser = fbuser;
                ReadingFrom = fbuser.ReadingFrom;

                $("#reader-name").text(userdata.FullName);
                $("#reader-email").text(user.email);

                var patient = firebase.database().ref().child("Patients");
                patient.child(fbuser.ReadingFrom).once('value').then(function (snap) {
                    var patientData = snap.val();
                    $("span#patientName").text(patientData.FullName);

                });

                getUsersToFollow(user.uid);

            });

            var profilePics = firebase.storage().ref().child("ProfilePictures");
            var imageRef = profilePics.child(user.uid).child('ProfilePicture.png');
            imageRef.getDownloadURL().then(function (url) {
                $("#Reader-Profile-Picture").setAttribute('src', url);
            }).catch(function (error) {

                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/object-not-found':
                        // File doesn't exist
                        var pp = $("#Reader-Profile-Picture");
                        pp.attr('src', '../../img/Logo.png');

                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;

                    case 'storage/canceled':
                        // User canceled the upload
                        break;

                    case 'storage/unknown':
                        // Unknown error occurred, inspect the server response
                        break;
                }
            });

        
        
        }
    });


}());


function getUsersToFollow(uid) {
    var reader = firebase.database().ref().child("Readers").child(uid);
    reader.child("PatientList").once('value').then(function(snap) {
        snap.forEach(function(snapData) {
            var pid = snapData.key;

            createPatientListingRow(pid, uid);

        });
    });
}

function createPatientListingRow(pid, uid) {
    firebase.database().ref().child("Patients").child(pid).once('value').then(function(snap){
        
        var val = snap.val();

        var body = document.getElementById('patientListBody');
        var row = document.createElement('tr');
        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var btn = document.createElement('button');

        td1.innerHTML = val.FullName;

        if (pid == ReadingFrom) {
            btn.innerHTML = "Selected";
            btn.setAttribute('class', 'btn btn-outline-purple');
        } else {
            btn.innerHTML = "Select";
            btn.setAttribute('class', 'btn btn-purple');
        }

        btn.addEventListener('click', function() {
            switchPatientTo(pid, uid);
        });
        td2.appendChild(btn);

        row.appendChild(td1);
        row.appendChild(td2);

        body.appendChild(row);


    });

}

function switchPatientTo(pid, uid) {
    firebase.database().ref().child("Readers").child(uid).child("ReadingFrom").set(pid);
    location.href = "../Journal/journal.html";
}