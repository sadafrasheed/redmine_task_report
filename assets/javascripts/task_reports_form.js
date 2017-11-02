/**
 * Created by dx-sadaf on 3/3/15.
 */

var short_leaves_control_count = 0;
var extra_hours_control_count = 0;

var common_options = {step: 10, 'timeFormat': 'g:ia'};
var short_leave_options = { minTime: '08:00am', maxTime: '05:00pm', disableTimeRanges: [['1:10pm', '2:00pm']] };
var extra_hours_options = { minTime: '12:00am', maxTime: '11:50pm', disableTimeRanges: [['8:00am', '1:00pm'],['2:10pm','5:00pm']] };

var short_leaves_selector = '[id^="task_report_task_report_short_leaves_attributes_"]';
var extra_hours_selector = '[id^="task_report_task_report_extra_hours_attributes_"]';
var start_times_selector = '[id$="_start_time"]';
var end_times_selector = '[id$="_end_time"]';


jQuery(document).ready(function (){

    $(".more-options-toggle").click(function(){
		if($(".more-options-wrapper").is(":visible")){
			$(".more-options-wrapper").slideUp();
			$(this).text("More Options");			
		}else{
			$(".more-options-wrapper").slideDown();
			$(this).text("Less Options");
		}
        
    });


    $('#task_report_worked_from_home').change(function (){
        if($(this).is(':checked')){
            $('.reason-wrapper').slideDown();
        }else{
            $('.reason-wrapper').slideUp();
        }
    });

    $('#short-leaves-chk').change(function (){
        if($(this).is(':checked')){
            $('.short-leave-controls-wrapper').slideDown();
        }else{
            $('.short-leave-controls-wrapper').slideUp();
            $("input"+short_leaves_selector+start_times_selector).val("").trigger("changeTime");
        }
    });

    $('#extra-hours-chk').change(function (){
        if($(this).is(':checked')){
            $('.extra-hours-controls-wrapper').slideDown();
        }else{
            $('.extra-hours-controls-wrapper').slideUp();
            $("input"+extra_hours_selector+start_times_selector).val("").trigger("changeTime");
        }
    });


    $('.datepicker').datepick({dateFormat: 'dd-M-yyyy'});


    $('#task_report_time_from').timepicker({
        minTime: '07:00am',
        maxTime: '06:00pm',
        step:10
    });

    $('#task_report_time_from').on('changeTime', function (){

        var task_report_time_to = $('#task_report_time_to');
        task_report_time_to.timepicker('option',{
            durationTime: $('#task_report_time_from').val(),
            showDuration: true
        });

        var this_value = $(this).val();
        var time_to_value = task_report_time_to.val();
        if( time_to_value != "" ){
            updateDuration( task_report_time_to );

            updateStatus();
        }

        $(short_leaves_selector+start_times_selector).timepicker('option',{minTime: this_value });
        $(short_leaves_selector+end_times_selector).timepicker('option',{minTime: this_value });

        /*$(extra_hours_selector+end_times_selector).timepicker('option',{maxTime: this_value});
        $(extra_hours_selector+start_times_selector).timepicker('option',{maxTime: this_value});*/

    });

    $('#task_report_time_to').timepicker({
        step:10 ,
        minTime: '07:00am',
        maxTime: '11:50pm'/*,
        durationTime: $('#task_report_time_from').val(),
        showDuration: true*/
    });

    $('#task_report_time_to').on('changeTime', function (){
        updateDuration( $(this) );
        updateStatus();


        var this_value = $(this).val();
        $(short_leaves_selector+start_times_selector).timepicker('option',{maxTime: this_value });
        $(short_leaves_selector+end_times_selector).timepicker('option',{maxTime: this_value });

        /*$(extra_hours_selector+end_times_selector).timepicker('option',{minTime: this_value});
        $(extra_hours_selector+start_times_selector).timepicker('option',{minTime: this_value});*/
    });


    $(".add-short-leaves-group").on("click",function (){
        short_leaves_control_count++;
        addAnother(this,short_leaves_control_count,short_leave_options)
    });


    $(".add-extra-hours-group").on("click",function (){
        extra_hours_control_count++;
        addAnother(this,extra_hours_control_count,extra_hours_options)
    });

    // short leaves
    var short_leaves_start_time = $(short_leaves_selector+start_times_selector);
    var short_leaves_end_time =  $(short_leaves_selector+end_times_selector);


    bindStartTimeEvents(short_leaves_start_time,short_leave_options);
    bindEndTimeEvents(short_leaves_end_time, short_leave_options);


    // extra hours
    var extra_hours_start_time = $(extra_hours_selector+start_times_selector);
    var extra_hours_end_time = $(extra_hours_selector+end_times_selector);

    bindStartTimeEvents(extra_hours_start_time,extra_hours_options);
    bindEndTimeEvents(extra_hours_end_time, extra_hours_options);



    $("select[id^=hours_worked_]").change(function (){
        var hour = $(this).val();
        var min = $(this).siblings("select[id^=minutes_worked_]").val();
        min = minute_to_decimal(min);
        $(this).siblings("input[type=hidden]").val(hour+"."+min);

        updateTaskTimeMessage();
    });

    $("select[id^=minutes_worked_]").change(function (){
        var hour = $(this).siblings("select[id^=hours_worked_]").val();
        var min = $(this).val();
        min = minute_to_decimal(min);
        $(this).siblings("input[type=hidden]").val(hour+"."+min);

        updateTaskTimeMessage();
    });




    enable_validation();

});

/** TODO:
 * handle onchange event of start-times...
 * update time but first check if start-time is not greater than end time
 */

function bindStartTimeEvents(obj,options)
{
    initializeTimePicker(obj, options);

    setInitOptionsForShortLeaves(obj);

    obj.on('changeTime',function (){

        var endTime = $(this).siblings('.timepicker');

        endTime.timepicker('option',{
            durationTime: $(this).val(),
            minTime:  $(this).val(),
            showDuration: true
        });

        if(endTime.val() != ""){
            endTime.val("");
            updateDuration(endTime);
            updateStatus();
        }

    });
}

function setInitOptionsForShortLeaves(obj)
{
    // set time range of short leaves to be equal to working hours duration...
    var task_report_to_time = $('#task_report_time_to').val();
    if( obj.is(short_leaves_selector) && task_report_to_time !="" ){
        obj.timepicker('option',{
            minTime: $('#task_report_time_from').val(),
            maxTime: task_report_to_time
        });
    }
}

function bindEndTimeEvents(obj, options)
{
    initializeTimePicker(obj, options)

    setInitOptionsForShortLeaves(obj);

    obj.on('changeTime', function (){
        updateDuration( $(this) );
        updateStatus();
    });
}

function initializeTimePicker(obj, options)
{
    $(obj).timepicker(common_options);

    var defaults = {
        minTime: '08:30am',
        maxTime: '05:30pm',
        disableTimeRanges: []
    };

    options = $.extend({},defaults,options);

    obj.timepicker('option',options);
}


function updateDuration(obj)
{
    obj.parents('.control-group').find('input[readonly=readonly]').val( obj.timepicker('getDuration') );
}


function addAnother(obj,count, options)
{
    var source = $(obj).parents('.control-wrapper').find(".control-group:first-child");

    var start = source.find('[id$="_start_time"]');
    var end =  source.find('[id$="_end_time"]');

    var start_id = start.attr('id').replace('0',count);
    var end_id = end.attr('id').replace('0',count);

    var start_name = start.attr('name').replace('0',count);
    var end_name = end.attr('name').replace('0',count);



    var last = $(obj).parents('.control-wrapper').find(".control-group:last");
    if(last.length < 1){
        last = source;
    }

    var new_group = $('<div class="control-group"></div>').insertAfter(last);

    var new_start = start.clone()
        .attr({id:start_id, name: start_name})
        .val("")
        .appendTo(new_group);

    bindStartTimeEvents(new_start, options)

    new_group.append(" - ");

    var new_end = end.clone()
        .attr({id:end_id, name: end_name})
        .val("")
        .appendTo(new_group);

    bindEndTimeEvents(new_end, options)

    new_group.append(' <input type="text" readonly="readonly" class="short-leaves-total-hours">');


}

function updateStatus()
{

    var workingHours =  $.timeMaths('subtract', $('#task_report_time_to').val(), $('#task_report_time_from').val());

    var shortLeaves = "0 min";
    var short_leaves_start_time = $(short_leaves_selector+start_times_selector);
    short_leaves_start_time.each(function (){
        var leave = $.timeMaths('subtract', $(this).parents(".control-group").find(end_times_selector).val(), $(this).val());
        shortLeaves = $.timeMaths('add',shortLeaves,leave);
    });

    var extraHours = "0 min";
    var extra_hours_start_time = $(extra_hours_selector+start_times_selector);
    extra_hours_start_time.each(function (){
       var hours = $.timeMaths('subtract', $(this).parents(".control-group").find(end_times_selector).val(), $(this).val());
       extraHours = $.timeMaths('add',extraHours,hours);
    });

    var hoursMinusShortLeaves = $.timeMaths('subtract',workingHours,shortLeaves)

    var netWorkingHours = $.timeMaths('add', extraHours, hoursMinusShortLeaves );

    var requiredHours = $("#required-hours span:nth-child(2)").text();

    $("#office-hours span:nth-child(2)").text(workingHours);
    $("#working-hours span:nth-child(2)").text(netWorkingHours);

    var showTotal = false;
    if( shortLeaves == "0 mins" ){
        $("#short-leaves-logged").hide();
    }else{
        $("#short-leaves-logged").show();
        showTotal = true;
    }
    $("#short-leaves-logged span:nth-child(2)").text(shortLeaves);

    if(extraHours == "0 mins"){
        $("#extra-hours-logged").hide();
    }else{
        $("#extra-hours-logged").show();
        showTotal = true;
    }
    $("#extra-hours-logged span:nth-child(2)").text(extraHours);

    if(showTotal){
        $("#working-hours").show();
    }else{
        $("#working-hours").hide();
    }

    $("input#task_report_total_short_leaves").val(shortLeaves)
    $("input#task_report_total_extra_hours").val(extraHours)
    $("input#task_report_total_working_hours").val(netWorkingHours)



    /*var comparisonResult = $.timeMaths('compare', netWorkingHours,requiredHours)
    switch(comparisonResult){
        case 0:
            $("#status-less-hours").hide();
            $("#status-complete-hours").show().text("You have completed your hours");
        break;

        case 1:
            var more = $.timeMaths('subtract',netWorkingHours, requiredHours );
            $("#status-less-hours").hide();
            $("#status-complete-hours").show().text("You have worked "+more+" more than required");
        break;

        case -1:
            var less = $.timeMaths('subtract',requiredHours, netWorkingHours );
            $("#status-less-hours span").text(less);
            $("#status-less-hours").show();
            $("#status-complete-hours").hide();
        break;
    }*/

    updateTaskTimeMessage();
}

function updateTaskTimeMessage()
{
    var taskTime = totalTaskTime();
    var workingHours = $("#working-hours span:nth-child(2)").text();

    var comparisonResult = $.timeMaths('compare', taskTime,workingHours)
    switch(comparisonResult){
        case 0:
            $(".todays-hours-comparison").hide();
            $("#free-hours").hide();
            $("input#task_report_total_free_hours").val("0 mins");
            break;

        case 1:
            var more = $.timeMaths('subtract',taskTime, workingHours );
            $(".todays-hours-comparison").show().text("You have logged "+more+" extra");
            $("#free-hours").hide();
            $("input#task_report_total_free_hours").val("0 mins");
            break;

        case -1:
            var less = $.timeMaths('subtract',taskTime, workingHours );
            $(".todays-hours-comparison").show().text("You have logged "+less+" less than required");
            $("#free-hours").show();
            $("#free-hours span:nth-child(2)").text(less);
            $("input#task_report_total_free_hours").val(less);
            break;
    }


}

function totalTaskTime()
{
    var time = 0;
    $("select[id^=hours_worked]").each(function (){
        var duration = $(this).val() + " hrs "+ $(this).siblings("select[id^=minutes_worked_]").val() + " mins";
        time = $.timeMaths('add', duration, time );
    });

    $("input#task_report_total_logged_hours").val(time);
    $("#logged-hours span:nth-child(2)").text(time);
    $("#logged-hours").show();

    if(time != 0){
        time = $.timeMaths('add', '1 hr', time ); // lunch break
    }

    return time;
}


minute_to_decimal= function (min){
    return Math.round( min * 100 / 60 );
}




function enable_validation()
{
    $("#new_task_report").validationEngine();
    /*$("#new_task_report").validationEngine('attach', {
        onValidationComplete: function(form, status){
            console.log(status);
            if(status){
                console.log("form.submit()" );
                //form.validationEngine('detach');
                //form.submit();
            }
        }
    });*/

    $("#new_task_report button.btn-primary").click(function (){
        var validated = $("#new_task_report").validationEngine('validate');
        /*console.log(validated);
        if(validated){
            $("#new_task_report").submit();
        }*/
        return validated;
    });

}

function checkIssueHours(field, rules, i, options){
    if( !timeEmpty($(field).parents("table.list tr").find("select[id ^=hours_worked]").val()) ||
        !timeEmpty($(field).parents("table.list tr").find("select[id ^=minutes_worked]").val())
    ) {
        if($.trim($(field).val()) == "" ) {
            rules.push('required');
            //return true;
            return "You've logged hours for this task.";
        }
    }
}

function checkStartTime(field, rules, i, options){
    if( !timeEmpty($(field).siblings("input"+start_times_selector).val()) ) {
        if($.trim($(field).val()) == "" ) {
            rules.push('required');
            //return true;
            return options.allrules.required.alertText;
        }
    }
}

function checkEndTime(field, rules, i, options){
    if( !timeEmpty($(field).siblings("input"+end_times_selector).val()) ) {
        if($.trim($(field).val()) == "" ) {
            rules.push('required');
            //return true;
            return options.allrules.required.alertText;
        }
    }
}


function timeEmpty(val)
{
    return $.trim(val) == "" || val == "0" || val == 0
}
