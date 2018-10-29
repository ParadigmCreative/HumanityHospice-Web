var firebaseReader;

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
      $("#Reader-Profile-Picture").setAttribute('src', url);
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
        Post: data.Post,
        Timestamp: data.Timestamp
      };

      var commentData = data.Comments;
      if (commentData != null) {
        postData["Comments"] = [];

        var comments = Object.keys(data.Comments);
        comments.forEach(function (key) {
          var item = data.Comments[key];
          postData.Comments.push(item);
        });
      }

      if (data.PostImageURL != null) {
        postData["PostImageURL"] = data.PostImageURL;
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
  leftData.setAttribute('class', 'col-xl-1 col-lg-1 col-md-2 col-sm-3 col-4 mb-4');

  var rightData = document.createElement('div');
  rightData.setAttribute('class', 'col-xl-11 col-lg-10 col-md-9 col-sm-9 col');

  var img = document.createElement('img');
  img.setAttribute('src', "../../img/Logo.png");
  img.setAttribute('class', 'rounded, img-fluid');
  leftData.appendChild(img);

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

  if (postData.PostImageURL != null) {
    var img = document.createElement('img');
    img.setAttribute('class', 'img-fluid rounded mx-auto');
    img.id = "post-picture";
    img.setAttribute('src', postData.PostImageURL);
    img.setAttribute('style', 'max-width: 400px');

    var col = document.createElement('div');
    col.setAttribute('class', 'col');
    col.appendChild(img);

    var pimagerow = document.createElement('div');
    pimagerow.setAttribute('class', 'row my-3');
    pimagerow.appendChild(col);

    rightData.appendChild(pimagerow);

  }



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

  var inputRow = document.createElement('div');
  inputRow.setAttribute('class', 'row my-3');
  var inputCol1 = document.createElement('div');
  inputCol1.setAttribute('class', 'col-auto');
  var inputButton = document.createElement('button');
  inputButton.setAttribute('class', 'btn btn-purple');
  inputButton.innerHTML = "Post!";

  inputButton.addEventListener('click', function() {
    var comText = document.getElementById('new-comment').value;
    addComment(postData.key, comText);
  });

  var inputCol2 = document.createElement('div');
  inputCol2.setAttribute('class', 'col');
  var inputGroup = document.createElement('div');
  inputGroup.setAttribute('class', 'input-group');
  var input = document.createElement('textarea');
  input.setAttribute('class', 'form-control');
  input.setAttribute('type', 'text');
  input.setAttribute('id', 'new-comment');
  input.setAttribute('placeholder', 'Write your comment here...');


  inputCol1.appendChild(inputButton);
  inputRow.appendChild(inputCol1);

  inputGroup.appendChild(input);
  inputCol2.appendChild(inputGroup);
  inputRow.appendChild(inputCol2);

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

  var comment = document.createElement('div');
  comment.id = "comment";
  var commentMainRow = document.createElement('div');
  commentMainRow.className = "row";
  var commentImgCol = document.createElement('div');
  commentImgCol.className = "col-lg-1";
  var commentImg = document.createElement('img');
  commentImg.setAttribute('src', '../../img/Logo.png');
  var commentDataCol = document.createElement('div');
  commentDataCol.className = "col-lg-10";
  var commentDataRowTop = document.createElement('div');
  commentDataRowTop.className = "row";
  var commentDataTopCol = document.createElement('div');
  commentDataTopCol.className = "col";
  var commentDataTopH4 = document.createElement('h4');
  commentDataTopH4.id = "commenter-name";
  commentDataTopH4.innerHTML = commentData.PosterName;
  var commentDataTopCol2 = document.createElement('div');
  commentDataTopCol2.className = "col text-right";
  var commentDataTopH6 = document.createElement('h6');
  commentDataTopH6.id = "timestamp";
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

  commentDataTopH6.innerHTML = tm + " - " + dt;
  var commentDataRowBottom = document.createElement('div');
  commentDataRowBottom.className = "row";
  var commentDataBottomCol = document.createElement('div');
  commentDataBottomCol.className = "col";
  var commentDataBottomPost = document.createElement('p');
  commentDataBottomPost.id = "comment-post";
  commentDataBottomPost.innerHTML = commentData.Comment;
  var commentSepRow = document.createElement('div');
  var commentSepCol = document.createElement('div');
  var commentSep = document.createElement('hr');
  commentSep.setAttribute('class', 'my-3');

  commentImgCol.appendChild(commentImg);
  commentMainRow.appendChild(commentImgCol);

  commentDataTopCol.appendChild(commentDataTopH4);
  commentDataRowTop.appendChild(commentDataTopCol);
  commentDataCol.appendChild(commentDataRowTop);

  commentDataTopCol2.appendChild(commentDataTopH6);
  commentDataRowTop.appendChild(commentDataTopCol2);

  commentDataBottomCol.appendChild(commentDataBottomPost);
  commentDataRowBottom.appendChild(commentDataBottomCol);
  commentDataCol.appendChild(commentDataRowBottom);

  commentMainRow.appendChild(commentDataCol);

  commentSepCol.appendChild(commentSep);
  commentSepRow.appendChild(commentSepCol);

  comment.appendChild(commentMainRow);
  comment.appendChild(commentSepRow);

  return comment;

}


function addComment(postID, commentText) {

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
