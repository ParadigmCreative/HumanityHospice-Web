
(function () {

    $(document).ready(function () {
        var width = $(document).width();
        if (width < 576) {
            $("#menu-btn-mobile").click();
        } else {
            var sidebar = $("#sidebarmenu");
            sidebar.addClass("show");
        }
    });

    var sendBtn = document.getElementById('send');
    sendBtn.addEventListener('click', function () {
        var text = document.getElementById('encText').value;

        var d = new Date();
        var seconds = Math.round(d.getTime() / 1000);

        var board = firebase.database().ref().child('EncouragementBoards').child(firebaseReader.ReadingFrom);

        board.push().set({
            Message: text,
            PosterName: firebaseReader.FullName,
            PosterUID: firebaseReader.UID,
            Timestamp: seconds
        });

        location.reload();

    });

    if (!firebase.apps.length) {
        var config = {
            apiKey: "AIzaSyAwIcQm5O23O87FXYTa8jkPPeOlu9HRJCM",
            authDomain: "humanityhospice-9ce45.firebase.com",
            databaseURL: "https://humanityhospice-9ce45.firebaseio.com",
            projectId: "humanityhospice-9ce45",
            storageBucket: "humanityhospice-9ce45.appspot.com",
            messagingSenderId: "669612038928"
        };

        firebase.initializeApp(config);
    }

    firebase.auth().onAuthStateChanged(function (user) {
        var readers = firebase.database().ref().child("Readers");

        readers.child(user.uid).once('value').then(function (snap) {
            var userdata = snap.val();
            var fbuser = {
                FullName: userdata.FullName,
                ReadingFrom: userdata.ReadingFrom,
                UID: user.uid
            };

            firebaseReader = fbuser;
            currentAppUser = fbuser;

            $("#reader-name").text(userdata.FullName);
            $("#reader-email").text(user.email);

            var patient = firebase.database().ref().child("Patients");
            patient.child(fbuser.ReadingFrom).once('value').then(function (snap) {
                var patientData = snap.val();
                $("span#patientName").text(patientData.FullName + " Encouragement Board");

            });

            getEncouragementPosts(fbuser.ReadingFrom, user.uid);

        });

        var profilePics = firebase.storage().ref().child("ProfilePictures");
        var imageRef = profilePics.child(user.uid).child('ProfilePicture.png');
        imageRef.getDownloadURL().then(function (url) {
            $("#Reader-Profile-Picture").attr('src', url);
            currentUserProfilePictureURL = url;
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



    });

}());


function getEncouragementPosts(pid, uid) {
    var encBoards = firebase.database().ref().child('EncouragementBoards');
    var patientBoard = encBoards.child(pid);
    patientBoard.orderByChild('PosterUID').equalTo(uid).once('value').then(function(snap){
        snap.forEach(function(snapData) {
            var data = snapData.val();
            var key = snapData.key;
            var encPost = {
                Timestamp: data.Timestamp,
                PosterUID: data.PosterUID,
                PosterName: data.PosterName,
                Message: data.Message
            };
            createPostRow(encPost);
        });
    });
}

function createPostRow(post) {
    // MAIN POST ROW
    var postRow = document.createElement('div');
    postRow.setAttribute('class', 'row my-3');

    var postCol = document.createElement('div');
    postCol.setAttribute('class', 'col');

    var contentRow = document.createElement('div');
    contentRow.setAttribute('class', 'row');

    // LEFT POST COL
    var leftCol = document.createElement('div');
    leftCol.setAttribute('class', 'col-xl-1 col-lg-2 col-md-3 col-sm-3 col-4 mb-4');

    var img = document.createElement('img');
    img.setAttribute('src', "../../img/Logo.png");
    img.setAttribute('class', 'rounded profile-img img-fluid');
    leftCol.appendChild(img);

    // RIGHT POST COL
    var rightCol = document.createElement('div');
    rightCol.setAttribute('class', 'col-xl-11 col-lg-10 col-md-9 col-sm-9 col');

    var nameRow = document.createElement('div');
    nameRow.setAttribute('class', 'row');

    var nameCol = document.createElement('div');
    nameCol.setAttribute('class', 'col');

    var h3Name = document.createElement('h3');
    h3Name.setAttribute('class', 'text-left');

    var bold = document.createElement('b');
    var span = document.createElement('span');
    span.setAttribute('class', 'poster-name');
    span.innerHTML = post.PosterName;

    bold.appendChild(span);
    h3Name.appendChild(bold);
    nameCol.appendChild(h3Name);
    nameRow.appendChild(nameCol);

    rightCol.appendChild(nameRow);

    var timestampH6 = document.createElement('p');
    timestampH6.id = "timestamp";
    timestampH6.setAttribute('class', 'timestamp-font')
    var d = new Date(post.Timestamp * 1000);
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    var dt = d.toLocaleDateString("en-US", options);
    var tm = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    timestampH6.innerHTML = tm + " - " + dt;

    var timeCol = document.createElement('div');
    timeCol.setAttribute('class', 'col text-right');
    timeCol.appendChild(timestampH6);

    nameRow.appendChild(timeCol);

    var messageRow = document.createElement('div');
    messageRow.setAttribute('class', 'row');
    var messageCol = document.createElement('div');
    messageCol.setAttribute('class', 'col');
    var ppost = document.createElement('p');
    ppost.setAttribute('class', 'post-message');
    ppost.innerHTML = post.Message;

    messageCol.appendChild(ppost);
    messageRow.appendChild(messageCol);
    rightCol.appendChild(messageRow);

    // POST SEPARATOR
    var sep = document.createElement('hr');
    sep.setAttribute('class', 'my-5');

    var sepCol = document.createElement('div');
    sepCol.setAttribute('class', 'col');
    sepCol.appendChild(sep);

    var sepRow = document.createElement('div');
    sepRow.setAttribute('class', 'row');
    sepRow.appendChild(sepCol);

    // Add content to content Row
    contentRow.appendChild(leftCol);
    contentRow.appendChild(rightCol);

    // Add contetnt row and separator rows to main column
    postCol.appendChild(contentRow);
    postCol.appendChild(sepRow);

    postRow.appendChild(postCol);

    var posts = document.getElementById('EncPosts');
    posts.insertBefore(postRow, posts.childNodes[0])

}