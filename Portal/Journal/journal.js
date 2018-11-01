var firebaseReader;
var currentUserProfilePictureURL;

(function() {

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

  firebase.auth().onAuthStateChanged(function(user) {
    var readers = firebase.database().ref().child("Readers");

    readers.child(user.uid).once('value').then(function(snap) {
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
      patient.child(fbuser.ReadingFrom).once('value').then(function(snap) {
        var patientData = snap.val();
        $("span#patientName").text(patientData.FullName + " Journal");

      });

      getPosts(userdata.ReadingFrom);

    });

    var profilePics = firebase.storage().ref().child("ProfilePictures");
    var imageRef = profilePics.child(user.uid).child('ProfilePicture.png');
    imageRef.getDownloadURL().then(function(url) {
      $("#Reader-Profile-Picture").attr('src', url);
      currentUserProfilePictureURL = url;
    }).catch(function(error) {

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


function getPosts(pid) {
  var journals = firebase.database().ref().child("Journals");
  journals.child(pid).orderByChild('Timestamp').once('value').then(function(snap) {
    snap.forEach(function(postSnap) {
      var data = postSnap.val();

      var postData = {
        key: postSnap.key,
        PatientName: data.PatientName,
        PID: pid,
        Post: data.Post,
        Timestamp: data.Timestamp
      };

      if (data.PostImageURL != null) {
        postData["PostImageURL"] = data.PostImageURL;
      }

      var commentData = data.Comments;
      if (commentData != null) {
        postData["Comments"] = [];

        var comments = Object.keys(data.Comments);
        comments.forEach(function (key) {
          var item = data.Comments[key];
          postData.Comments.push(item);
        });
      }
      
      addPostRow(postData);

    });
  });
}

function addPostRow(postData) {
  var posts = document.getElementById('posts');

  var row = document.createElement('div');
  row.setAttribute('class', 'row');
  row.setAttribute('id', 'post-item-row');

  var leftData = document.createElement('div');
  leftData.setAttribute('class', 'col-lg-2 col-md-3 col-sm-3 col-xs-4 mb-4');

  var rightData = document.createElement('div');
  rightData.setAttribute('class', 'col-lg-10 col-md-9 col-sm-9 col-xs-12');

  var profImg = document.createElement('img');

  firebase.database().ref().child('ProfilePictures').child(postData.PID).once('value').then(function (snap) {
    var url = snap.val();
    if (url) {
      profImg.setAttribute('src', url);
    } else {
      profImg.setAttribute('src', "../../img/Logo.png");
    }
  });

  var cropper = document.createElement('div');
  cropper.setAttribute('class', 'image-cropper d-block');

  var imgRow = document.createElement('div');
  imgRow.setAttribute('class', 'row');
  var imgCol1 = document.createElement('div');
  imgCol1.setAttribute('class', 'col');
  var imgCol2 = document.createElement('div');
  imgCol2.setAttribute('class', 'col');

  profImg.setAttribute('class', 'rounded profile-img img-fluid mx-auto');
  cropper.appendChild(profImg);
  imgRow.appendChild(imgCol1);
  imgRow.appendChild(cropper);
  imgRow.appendChild(imgCol2);
  leftData.appendChild(imgRow);

  var nameRow = document.createElement('div');
  nameRow.setAttribute('class', 'row');

  var nameCol = document.createElement('div');
  nameCol.setAttribute('class', 'col');

  var h3Name = document.createElement('h3');
  h3Name.setAttribute('class', 'text-left');

  var bold = document.createElement('b');
  var span = document.createElement('span');
  span.setAttribute('class', 'patient-name');
  span.innerHTML = postData.PatientName;

  bold.appendChild(span);
  h3Name.appendChild(bold);
  nameCol.appendChild(h3Name);
  nameRow.appendChild(nameCol);

  rightData.appendChild(nameRow);



  var messageRow = document.createElement('div');
  messageRow.setAttribute('class', 'row');
  var messageCol = document.createElement('div');
  messageCol.setAttribute('class', 'col');
  var ppost = document.createElement('p');
  ppost.setAttribute('class', 'post-message');
  ppost.innerHTML = postData.Post;

  messageCol.appendChild(ppost);
  messageRow.appendChild(messageCol);
  rightData.appendChild(messageRow);


  if (postData.PostImageURL != null) {
    var img = document.createElement('img');
    img.setAttribute('class', 'img-fluid rounded mx-auto');
    img.id = "post-picture";
    img.setAttribute('src', postData.PostImageURL);
    img.setAttribute('style', 'max-width: 300px; max-height: 300px; border-radius: 50%;');
    img.setAttribute('data-toggle', 'modal');
    img.setAttribute('data-target', '#imagemodal');
    img.addEventListener('click', function () {
      var preview = $('#imagePreview');
      preview.attr('src', img.src);
    });

  
    var col = document.createElement('div');
    col.setAttribute('class', 'col-xs-10 p-4');
    col.appendChild(img);

    var pimagerow = document.createElement('div');
    pimagerow.setAttribute('class', 'row my-3');
    pimagerow.appendChild(col);

    rightData.appendChild(pimagerow);
  }


  //    aefasdfasdf

  var commentsRow = document.createElement('div');
  commentsRow.setAttribute('class', 'row my-3');

  var commentsCol = document.createElement('div');
  commentsCol.setAttribute('class', 'col');

  var commentsBorder = document.createElement('div');
  commentsBorder.setAttribute('class', 'comments rounded');


  if (postData.Comments != null) {
    postData.Comments.forEach(function (postCommentData) {
      var commentRow = createComment(postCommentData);
      commentsBorder.appendChild(commentRow);
    });
  }

  commentsCol.appendChild(commentsBorder);
  commentsRow.appendChild(commentsCol);

  rightData.appendChild(commentsRow);

  var inputTemplate = `
    <div class="col">
      <div class="row">
        <div class="col">
          <textarea id="new-comment" class="form-control" type="text" placeholder="Write your comment here..."></textarea> 
        </div> 
      </div> 
      <div class="row my-3">
        <div class="col-auto">
          <button class="btn btn-purple" onclick="addComment('${postData.key}')"> Post! </button> 
        </div> 
      </div> 
    </div>
  `

  var inputRow = document.createElement('div');
  inputRow.setAttribute('class', 'row my-3');

  inputRow.innerHTML = inputTemplate;

  // var inputCol1 = document.createElement('div');
  // inputCol1.setAttribute('class', 'col-auto');
  // var inputButton = document.createElement('button');
  // inputButton.setAttribute('class', 'btn btn-purple');
  // inputButton.innerHTML = "Post!";

  // inputButton.addEventListener('click', function() {
  //   var comText = document.getElementById('new-comment').value;
  //   addComment(postData.key, comText);
  // });

  // var inputCol2 = document.createElement('div');
  // inputCol2.setAttribute('class', 'col');
  // var inputGroup = document.createElement('div');
  // inputGroup.setAttribute('class', 'input-group');
  // var input = document.createElement('textarea');
  // input.setAttribute('class', 'form-control');
  // input.setAttribute('type', 'text');
  // input.setAttribute('id', 'new-comment');
  // input.setAttribute('placeholder', 'Write your comment here...');


  // inputCol1.appendChild(inputButton);
  // inputRow.appendChild(inputCol1);

  // inputGroup.appendChild(input);
  // inputCol2.appendChild(inputGroup);
  // inputRow.appendChild(inputCol2);

  rightData.appendChild(inputRow);

  //    asdfasdf

  row.appendChild(leftData);
  row.appendChild(rightData);

  var sepRow = document.createElement('div');
  sepRow.setAttribute('class', 'row');

  var sepCol = document.createElement('div');
  sepCol.setAttribute('class', 'col');

  var sep = document.createElement('hr');
  sep.setAttribute('class', 'my-5');

  sepCol.appendChild(sep);
  sepRow.appendChild(sepCol);

  // posts.appendChild(row);
  // posts.appendChild(sep);

  posts.insertBefore(sep, posts.childNodes[0]);
  posts.insertBefore(row, posts.childNodes[0]);

}


function createComment(commentData) {

  var d = new Date(commentData.Timestamp * 1000);
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

  var template = `
    <div class="row">
      <div class = "col-lg-1 col-md-2 col-sm-2 col-xs">
        <div class="row">
          <div class="col"></div>
            <div class="image-cropper mx-auto">
              <img class="img-fluid profile-img" src = "../../img/Logo.png">
            </div>
          <div class="col"></div>
        </div>
      </div>

      <div class="col-lg-7 col-sm-6 col-sm-6 col-xs-10">
        <h4 id="commenter-name">${commentData.PosterName}</h4> 
      </div> 
      
      <div class="col-lg-4 col-md-4 col-sm-4 col-xs-12">
        <p id="timestamp" class="timestamp-font">${tm + " - " + dt}</p> 
      </div> 

      <div class = "col-lg-12 col-md-12 col-sm-12 col-xs-12 m-3">
        <p id="comment-post">${commentData.Comment}</p> 
      </div> 
    </div> 
    <div>
      <div>
        <hr class="my-3">
      </div> 
    </div>
  `

  var comment = document.createElement('div');
  comment.id = "comment";

  comment.innerHTML = template;



  return comment;

}


function addComment(postID) {
  var commentText = document.getElementById('new-comment').value;

  var d = new Date();
  var seconds = Math.round(d.getTime() / 1000);

  var db = firebase.database().ref().child('Journals').child(firebaseReader.ReadingFrom);


  db.child(postID).child('Comments').push().set({
    Comment: commentText,
    PosterName: firebaseReader.FullName,
    PosterUID: firebaseReader.UID,
    Timestamp: seconds
  });

  location.reload();

}
