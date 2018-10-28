

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
        var email = document.getElementById('inputEmail').value;
        var password = document.getElementById('inputPassword').value;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(function (error) {
                var errorMessage = error.message;
                console.log(errorMessage);
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


}());


function handleLogin() {

}
