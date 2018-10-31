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
                $("span#patientName").text(patientData.FullName);

            });

            getPhotos(fbuser.ReadingFrom);

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


function getPhotos(readingFrom) {

    var albums = firebase.database().ref().child('PhotoAlbum');
    var album = albums.child(readingFrom);
    album.once('value').then(function(snap) {

        snap.forEach(function(snapChild) {
            var val = snapChild.val();
            var newPhoto = {
                Timestamp: val.Timestamp,
                URL: val.URL
            };

            createPhotoCol(newPhoto.URL);

        });
    });

}


function createPhotoCol(photoURL) {

    var col = document.createElement('div');
    col.setAttribute('class', 'col-lg-3 col-md-4 col-sm-4 col-xs-12');
    const template = `
        <div class = "text-center d-block mb-4 h-100" >
            <img id="photoalbumpost" data-toggle="modal" data-target="#imagemodal" src = "${photoURL}" alt = "" class="rounded img-fluid" style="max-height: 300px; max-width: 300px;">
        </div> 
    `

    col.innerHTML = template;
    var posts = document.getElementById('photoAlbumRow');
    posts.appendChild(col);

    var img = document.getElementById('photoalbumpost');
    // img.addEventListener('click', function () {
        
    //     var ClickTemplate = `<img src="${img.src}" id="imagePreview" class="img-fluid">`

    //     var area = document.getElementById('modalArea');
    //     area.innerHTML = ClickTemplate;

    // });

}