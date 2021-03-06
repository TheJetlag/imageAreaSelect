// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('MyCtrl', function($scope, $timeout, $ionicGesture, $window) {
  // arrays to store the click / drag coordinates
  var clicksX = new Array();
  var clicksY = new Array();

  var canvasDiv = document.getElementById('canvasDiv');
  var canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'canvas');
  $(canvasDiv).prepend(canvas);

	var context = canvas.getContext('2d');
  var restoreableImg;
	var imageObj = new Image();

  var newImageWidth = -1;
  var newImageHeight = -1;

	imageObj.onload = function() {
    // here we scale the image to fit in the screen
    var viewportHeight = $(window).height();
    var viewportWidth = $(window).width();

    var imageHeight = this.height;
    var imageWidth = this.width;

    // look if we have to downscale the image
    var scale = 1;
    if (viewportWidth < imageWidth) {
      scale = viewportWidth / imageWidth;
    }

    // downscale the image by the calculated factor
    newImageWidth = Math.floor(imageWidth * scale);
    newImageHeight = Math.floor(imageHeight * scale);

    // also downscale the canvasDiv
    $(canvasDiv).css("width", newImageWidth+"px");
    $(canvasDiv).css("height", newImageHeight+"px");

    // scale the canvas
    $(canvas).attr({width : newImageWidth, height: newImageHeight});

    // draw the image scaled on the canvas
    context.drawImage(imageObj, 0, 0, newImageWidth, newImageHeight);
    restoreableImg = canvas.toDataURL();
	};

  imageObj.src = getPhoneGapPath() + '/img/kitty.jpg';

  var restoreImage = function() {
    // reset variables
    clicksX = new Array();
    clicksY = new Array();
    lastX = -1;
    lastY = -1;

    $('.clipParent').css({
      "display" : "none",
      "top" : top-43,
      "position": "fixed",
      "left" : 0,
    });

    var img = new Image();
    img.onload = function () {
      context.drawImage(img, 0, 0);
    };
    img.src = restoreableImg;
  }


  // draggin
  var lastDeltaTime = 0;
  var lastX = -1;
  var lastY = -1;
  $ionicGesture.on('drag', function(e) {
    var deltaTime = e.gesture.deltaTime;

    //detect if this is a new drag
    if (lastDeltaTime > deltaTime) {
      // new drag, restore the originall image and resete click coordienates arrays

      restoreImage();
    }
    lastDeltaTime = deltaTime;

    var target = e.target.id;
    var source = e.srcElement.id;
    var x = e.gesture.touches[0].pageX - $(canvas).offset().left; // so we get the position inside the canvas (not of the whole screen)
    var y = e.gesture.touches[0].pageY - $(canvas).offset().top;
    //console.log(deltaTime + ": " + x + "," + y + " source: " + source + " target " + target);

    if (target === "canvas" && source === "canvas") {
      // add coordinates into array
      clicksX.push(x);
      clicksY.push(y);

      // check if we already have a lastX and lastY, then draw lines
      if (lastX != -1 && lastY != -1) {
        context.beginPath();
        context.moveTo(lastX,lastY);
        context.lineTo(x,y);
        context.lineWidth = 3;
        context.strokeStyle = 'green';
        context.stroke();
      }
      lastX = x;
      lastY = y;
    }
  }, $(canvasDiv));

  //drag end, user released his finger
  $ionicGesture.on('release', function(e) {
    extractArea();

    // darken the original image
    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(0, 0, newImageWidth, newImageHeight);

    //set the sliced area above the orignal image (canvas)
    var top = $('#canvasDiv').offset().top;
    $('.clipParent').css({
      "display" : "block",
      "top" : top-43,
      "position": "fixed",
      "left" : 0,
    });
  }, $(canvasDiv));

  var extractArea = function() {
    $(".clipParent").empty();

    // get the resized image from the canvas and use it as the src for the target
    var genimg = new Image();
    genimg.id = "genimg"
    genimg.src = restoreableImg;
    $(".clipParent").prepend(genimg);

    // build up the polyclip attribute
    var arr = [];
    for (var i=0; i < clicksX.length; i++) {
    	arr.push(clicksX[i]); arr.push(clicksY[i]);
    }
    $("#genimg")[0].setAttribute("data-polyclip", arr.join(", "));
    polyClip.init();
  }

  $scope.repick = function() {
    restoreImage();
  }

});

function getPhoneGapPath() {
    if (document.URL.indexOf( 'http://' ) === -1) {
      var path = window.location.pathname;
      path = path.substr( 0, path.length - 10 );
      return 'file://' + path;
    } else {
      return "..";
    }
};
