$(document).ready(function(){

    $("button.ancient").click(function(){
        let letter = $(this).text();
        $("#target").text($("#target").text() + letter);
    });

    $("button#clear").click(function(){
        $("#target").text("");
    });
});
