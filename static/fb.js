//Global variables
var accessToken = 0;
var friends = new Array();
var listID = 0;

function logout(){
  accessToken=0;
  $(".bubble").remove();
  $(".propic").hide();
  voffset=0;
  hoffset=0;


}

//Facebook SDK stuff
  window.fbAsyncInit = function() {
  FB.init({
    appId      : '541273012652657',
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : true  // parse XFBML
  });

  // Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
  // for any authentication related change, such as login, logout or session refresh. This means that
  // whenever someone who was previously logged out tries to log in again, the correct case below
  // will be handled.
  FB.Event.subscribe('auth.authResponseChange', function(response) {
    // Here we specify what we do with the response anytime this event occurs.
    if (response.status === 'connected') {
      // The response object is returned with a status field that lets the app know the current
      // login status of the person. In this case, we're handling the situation where they
      // have logged in to the app.
      console.log(response.authResponse)

      var fbbutton = document.getElementById('lbutton');

      fbbutton.style.right="0px";
      fbbutton.style.top="40px";
      fbbutton.style.left="auto";

      accessToken = response.authResponse.accessToken;
      console.log(accessToken);
      getFBPicture();
      testAPI();
      getFriendList();
    } else if (response.status === 'not_authorized') {
      // In this case, the person is logged into Facebook, but not into the app, so we call
      // FB.login() to prompt them to do so.
      // In real-life usage, you wouldn't want to immediately prompt someone to login
      // like this, for two reasons:
      // (1) JavaScript created popup windows are blocked by most browsers unless they
      // result from direct interaction from people using the app (such as a mouse click)
      // (2) it is a bad experience to be continually prompted to login upon page load.
      //FB.login();

    } else {
      // In this case, the person is not logged into Facebook, so we call the login()
      // function to prompt them to do so. Note that at this stage there is no indication
      // of whether they are logged into the app. If they aren't then they'll see the Login
      // dialog right after they log in to Facebook.
      // The same caveats as above apply to the FB.login() call here.
   //    FB.login(function(response) {
   // // handle the response,set the scope. We need read_friendlists
   //    }, {scope: 'read_friendlists'});
    logout();
    }
  });
  };

  (function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js";
  fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
  // Load the SDK asynchronously

  // Here we run a very simple test of the Graph API after login is successful.
  // This testAPI() function is only called in those cases.
  function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Good to see you, ' + response.name + '.');
    });
  }
  // Gets the users facebook picture and places it in the center
    function getFBPicture(){
      FB.api("/me/picture?height=200&width=200",function(response) {
        console.log(response);
        $(".propic").show();
        var $photo = $('#propic');

        if(response && !response.error)
        {
          if(!document.getElementById("self"))
          {
          var profileImage = response.data.url.split('https://')[1], //remove https to avoid any cert issues
                randomNumber = Math.floor(Math.random()*256);

          //add random number to reduce the frequency of cached images showing
          $photo.append('<img id="self" class="propic" style="border-radius:50%" src=\"http://' + profileImage + '?' + randomNumber + '\">');
        }
        }
      });
    }
    //Gets the facebook infomation for users "close friends" and creates them.
    function getFriendList(){
      FB.api("/me/friendlists", function(response){
        console.log(response);
        for(thing in response.data){
          var obj = response.data[thing];
          if(obj["list_type"] === "close_friends")
          {
            getFriends(obj["id"]);
          }
        }
      });
    }

    //Uses the list id from getFriends and gets the friends with the id;
    function getFriends(flistID)
    {
      FB.api(flistID+'/members', function(response){
        console.log(response.data);
        for(var friend in response.data)
        {
          thing = new Object();
          thing.name = response.data[friend]["name"];
          thing.id = response.data[friend]["id"];
          thing.photo= "";
          friends[friend] = thing;

        }
        console.log(friends);
        getFriendPictures();
      });
    }

    function getFriendPictures(){
      if(friends)
      {
        var count = 0;
      for(var person in friends)
      {
        getPictureHelper(count++);
      }

      }
    }
  var hoffset = 0;
  var voffset = 0;
    function getPictureHelper(friendNum){
    FB.api(friends[friendNum]["id"]+'/picture?width=100&height=100', function(response)
    {
      //var $photo = $('#circle'+friendNum);

      if(response && !response.error && accessToken != 0)
      {
        //Get our profile image URL
        var profileImage = response.data.url.split('https://')[1],
            randomNumber = Math.floor(Math.random()*256);
        friends[friendNum] = profileImage;
        var url = 'http://'+ profileImage+'?'+randomNumber;

        // Create a new bubble
        var iDiv = document.createElement('img');
        iDiv.id = 'circle'+friendNum;
        iDiv.className = 'bubble';
        iDiv.className +=' ui-draggable';

        // Offsets depending on how many friends there are.
        if((voffset*150) > (window.innerHeight-200))
        {
          hoffset++;
          voffset = 0;
          iDiv.style.top=(voffset*150)+'px';
          iDiv.style.right=-150-(hoffset*150)+'px';
        }
        else
        {
          iDiv.style.top=(voffset*150)+'px';
          iDiv.style.right=-150-(hoffset*150)+'px';
          voffset++;
        }

        iDiv.src = url;
        var totalBox = document.getElementById('totalbox')[0];
        totalbox.appendChild(iDiv);
        // Sets the bubble to draggable and also sets the function that gets called when its snapped.
        $('#'+iDiv.id).draggable({snap: ".snappoint", snapMode:"inner", stop: function(event, ui) {
              /* Get the possible snap targets: */
              var snapped = $(this).data('ui-draggable').snapElements;

              /* Pull out only the snap targets that are "snapping": */
              var snappedTo = $.map(snapped, function(element) {
                  return element.snapping ? element.item : null;
              });
              // This part tells us that a bubble was snapped in place, so this will be where we send to server.
              console.log(snappedTo);
          }});
        }
    });
    }
