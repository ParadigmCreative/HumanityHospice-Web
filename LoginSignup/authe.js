

(function(){

    var config = {
        apiKey: "AIzaSyAwIcQm5O23O87FXYTa8jkPPeOlu9HRJCM",
        authDomain: "humanityhospice-9ce45.firebaseapp.com",
        databaseURL: "https://humanityhospice-9ce45.firebaseio.com",
        projectId: "humanityhospice-9ce45",
        storageBucket: "humanityhospice-9ce45.appspot.com",
        messagingSenderId: "669612038928"
    };

    firebase.initializeApp(config);


    var signin = document.getElementById('signin-btn');
    signin.addEventListener('click', function(){
        var emailField = document.getElementById('inputEmail');
        var email = document.getElementById('inputEmail').value;

        var passField = document.getElementById('inputPassword');
        var password = document.getElementById('inputPassword').value;

        if (email == "") {
            emailField.classList.add('is-invalid');
        }

        if (password == "") {
            passField.classList.add('is-invalid');
        }


        firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(function (error) {
                var errorMessage = error.code;
                console.log(errorMessage);

                switch (errorMessage) {
                    case "auth/invalid-email":
                        console.log("EMAIL");
                        $("#error-window").addClass('alert alert-danger');
                        $("#error-window").text("Invalid Email");
                    case "auth/user-disabled":
                        $("#error-window").addClass('alert alert-danger');
                        $("#error-window").text("User has been disabled");
                    case "auth/user-not-found":
                        $("#error-window").addClass('alert alert-danger');
                        $("#error-window").text("User not found");
                    case "auth/wrong-password":
                        $("#error-window").addClass('alert alert-danger');
                        $("#error-window").text("Invalid Password");
                }

            });

    });


    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          if (user.uid == "pJR6aIo5o4WpnLlVXe7ZkwPDsl33") {
              currentFirebaseAppUser = user;
              location.href = "../NursePortal/nurseportal.html";
          } else {
              currentFirebaseAppUser = user;
              location.href = "../Portal/Journal/journal.html";
          }
      } else {
          console.log("No User");
      }
    });

    $('#btnPassReset').on('click', function() {
        var email = document.getElementById('inputPassReset').value;
        firebase.auth().sendPasswordResetEmail(email).then(function () {
            $('#reset-result').addClass('alert alert-success');
            $('#reset-result').text("Email sent successfult");
        }).catch(function (error) {
            var resultView = $('#reset-result');
            var errorCode = error.code;

            switch (errorCode) {
                case "auth/invalid-email":
                    resultView.text("Invalid Email");
                    resultView.addClass('alert alert-danger');
                    return;
                case "auth/user-not-found":
                    resultView.text("User not found");
                    resultView.addClass('alert alert-danger');
                    return;
            }

        });
    });


}());


function handleLogin() {

}
