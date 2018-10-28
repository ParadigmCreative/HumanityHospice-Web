
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

    var signup = document.getElementById('signup');
    signup.addEventListener('click', function() {

        var first = document.getElementById('inputFirst').value;
        var last = document.getElementById('inputLast').value;
        var email = document.getElementById('inputEmail').value;
        var password = document.getElementById('inputPassword').value;
        var patientcodebox = document.getElementById('patientCode');
        var patientcode = patientcodebox.value;

        if (patientcode != "") {
            var spinner = $('#spinner');
            spinner.toggleClass('loader');

            var invites = firebase.database().ref().child('InviteCodes');
            invites.child(patientcode).once('value').then(function(snap) {
                var exists = snap.val();
                if (exists) {
                    var patientID = snap.val();
                    var id = patientID.Patient;

                    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
                        .then(function() {
                        return firebase.auth().createUserWithEmailAndPassword(email, password)
                            .then(function(user) {
                                $("#PatientCodeModel").modal('hide');

                                var db = firebase.database().ref().child('Readers');

                                var data = {
                                    FirstName: first,
                                    LastName: last,
                                    FullName: first + " " + last,
                                    ReadingFrom: id
                                };

                                var PatientList = {};
                                PatientList[id] = true;

                                data["PatientList"] = PatientList;
                                console.log(data);

                                db.child(user.user.uid).set(data);

                            })
                            .catch(function(error){
                                    var errorMessage = error.message;
                                    console.log(errorMessage);
                            });
                        })
                        .catch(function(error) {
                        // Handle Errors here.
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            console.log(errorCode, errorMessage);
                        });

                } else {
                    if($("#patientCode").hasClass('is-invalid')) {
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


    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            if (user.uid == "pJR6aIo5o4WpnLlVXe7ZkwPDsl33") {
                currentFirebaseAppUser = user;
                location.href = "../NursePortal/nurseportal.html";
            } else {
                currentFirebaseAppUser = user;
                location.href = "../Portal/Jouranl/journal.html";
            }
        } else {
            console.log("No User");
        }
    });

}());