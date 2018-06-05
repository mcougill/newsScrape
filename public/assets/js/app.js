//scrape button
$("#scrape").on("click", function () {
    console.log("scrape button clicked");
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).done(function (data) {
        window.location = "/"
    });
});

//Set clicked nav option to active
$(".navbar-light").click(function() {
    $(".navbar-light").removeClass("active");
    $(this).addClass("active");
 });

//Save Article button
$(".save").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).done(function(data) {
        window.location = "/"
    })
});

//delete article button
$(".delete").on("click", function(){
    var id = $(this).attr("data-id");
    $.ajax({
        method:"POST",
        url:"/articles/delete/" + id
    }).done(function(data){
        window.location = "/saved"
    });
});

//save comments button
$(".saveComments").on("click", function(){
    console.log('save button clicked');
    var id = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url:"/comments/save/" + id,
        data: {
            text: $("#commentsText" + id).val()
        }
    }).done(function(data){
        $("#commentsText" + id).val("");
        $("modalComments").modal("hide");
        window.location = "/saved"
    });
});

//Delete comment button
$(".deleteComments").on("click", function(){
    var commentID = $(this).attr("data-comments-id");
    var articleID = $(this).attr("data-article-id");
    $.ajax({
        method:"DELETE",
        url:"/comments/delete/" + commentID + "/" + articleID
    }).done(function(data){
        $(".modalComments").modal("hide");
        window.location = "/saved"
    });

});