jQuery(document).ready(function (){

    $("#date_range").change(function (){
       if($(this).children(":selected").val() == "Custom"){
           $(".custom-date-range-wrapper").slideDown();
       }else{
           $(".custom-date-range-wrapper").slideUp();
       }
    });



});