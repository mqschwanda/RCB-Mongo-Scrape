// grab the articles as a json
$.getJSON('/articles', function(data) {
  // for each one
  for (var i = 0; i<data.length; i++){
    // display the apropos information on the page
    // $('#articles').append('<p data-id="' + data[i]._id + '">'+ data[i].title + '<br />'+ data[i].href + '</p>');
    $('#articles').append('<div data-id="'+data[i]._id+'" class="panel panel-default">'+
                            '<div class="panel-heading">'+
                              '<h3 class="panel-title">'+
                                data[i].title+
                              '</h3>'+
                            '</div>'+
                            '<div class="panel-body">'+
                              '<div class="col-xs-6 text-center">'+
                                '<a href="'+data[i].href+'" target="_blank">'+
                                  'Article Link'+
                                '</a>'+
                              '</div>'+
                              '<div class="col-xs-6 text-center">'+
                                '<button data-id="'+data[i]._id+'" type="button" class="btn comments-btn">'+
                                  'Commetns'+
                                '</button>'+
                              '</div>'+
                            '</div>'+
                          '</div>');
  }
});
// whenever someone clicks a post btn
$(document).on('click', '.comments-btn', function(){
  // empty the notes from the comment section
  $('#comments').empty();
  // save the id from the button tag
  var thisId = $(this).attr('data-id');

  // now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId,
  })
    // with that done, add the comment information to the page
    .done(function( data ) {
      console.log(data);
      // the title of the article
      $('#comments').append('<h2>'+data.title+'</h2>');
      $('#comments').append('<h5>Comment:</h5>');
      $('#comments').append('<h5>'+data.comment.title+'</h5>');
      $('#comments').append('<p>'+data.comment.body+'</p>');
      $('#comments').append('<div class="divider"></div>');
      // an input to enter a new title
      $('#comments').append('<input id="titleinput" name="title" >');
      // a textarea to add a new comment body
      $('#comments').append('<textarea id="bodyinput" name="body"></textarea>');
      // a button to submit a new comment, with the id of the article saved to it
      $('#comments').append('<button data-id="'+data._id+'" id="savenote">Save comment</button>');

      // if there's a comment in the article
      if(data.comment){
        // place the title of the comment in the title input
        $('#titleinput').val(data.comment.title);
        // place the body of the comment in the body textarea
        $('#bodyinput').val(data.comment.body);
      }
    });
});

// when you click the savenote button
$(document).on('click', '#savenote', function(){
  // grab the id associated with the article from the submit button
  var thisId = $(this).attr('data-id');

  // run a POST request to change the comment, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $('#titleinput').val(), // value taken from title input
      body: $('#bodyinput').val() // value taken from comment textarea
    }
  })
    // with that done
    .done(function( data ) {
      // log the response
      console.log(data);
      // empty the notes section
      $('#comments').empty();
    });

  // Also, remove the values entered in the input and textarea for comment entry
  $('#titleinput').val("");
  $('#bodyinput').val("");
})
