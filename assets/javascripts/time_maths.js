/**
 * Created by dx-sadaf on 3/6/15.
 */


(function ($){



    var _baseDate = _generateBaseDate();
    var _ONE_DAY = 86400;
    var _lang = {
        am: 'am',
        pm: 'pm',
        AM: 'AM',
        PM: 'PM',
        decimal: '.',
        mins: 'mins',
        hr: 'hr',
        hrs: 'hrs'
    };

    var _settings = {
        step: 10,
        timeFormat: 'g:ia'
    };


    // Plugin entry

    $.extend({
        timeMaths: function(method)
        {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            }
            //else if(typeof method === "object" || !method) { return methods.init.apply(this, arguments); }
            else { $.error("Method "+ method + " does not exist in timeMaths"); }
        }
    });

    var methods = {
        add: function (){
            var sum = 0;
            if (arguments[0].indexOf(":") != -1 ){
                for (var i = 0; i < arguments.length; i++) {
                    sum += _time2int(arguments[i]);
                }
            }else{
                for (var i = 0; i < arguments.length; i++) {
                    sum += _duration2int(arguments[i]);
                }
            }

            return _int2duration(sum);
        },

        subtract: function ( timeFrom, timeTo){
            if (arguments[0].indexOf(":") != -1 ){
                return _int2duration( _time2int(timeFrom) - _time2int(timeTo) );
            }else{
                return _int2duration( _duration2int(timeFrom) - _duration2int(timeTo) );
            }

        },


        // returns 0 if two times are equal
        // 1 if time1 is greater than time2
        // -1 if time1 is less than time2
        compare: function (time1, time2){
            if (arguments[0].indexOf(":") != -1 ){
                time1 =  _time2int(time1);
                time2 = _time2int(time2);
            }else{
                time1 = _duration2int(time1);
                time2 = _duration2int(time2);
            }

            if(time1 == time2) return 0;
            if(time1 > time2) return 1;
            if(time1 < time2) return -1;
        }

    }


    // private methods...
    function _generateBaseDate()
    {
        return new Date(1970, 1, 1, 0, 0, 0);
    }

    function _roundingFunction(seconds, settings)
    {
        if (seconds === null) {
            return null;
        } else {
            var offset = seconds % (settings.step*60); // step is in minutes

            if (offset >= settings.step*30) {
                // if offset is larger than a half step, round up
                seconds += (settings.step*60) - offset;
            } else {
                // round down
                seconds -= offset;
            }

            return seconds;
        }
    }



    function _int2duration(seconds, step)
    {
        seconds = Math.abs(seconds);
        var minutes = Math.round(seconds/60),
            duration = [],
            hours, mins;

        if (minutes < 60) {
            // Only show (x mins) under 1 hour
            duration = [minutes, _lang.mins];
        } else {
            hours = Math.floor(minutes/60);
            mins = minutes%60;

            // Show decimal notation (eg: 1.5 hrs) for 30 minute steps
            if (step == 30 && mins == 30) {
                hours += _lang.decimal + 5;
            }

            duration.push(hours);
            duration.push(hours == 1 ? _lang.hr : _lang.hrs);

            // Show remainder minutes notation (eg: 1 hr 15 mins) for non-30 minute steps
            // and only if there are remainder minutes to show
            if (step != 30 && mins) {
                duration.push(mins);
                duration.push(_lang.mins);
            }
        }

        return duration.join(' ');
    }

    function _int2time(seconds)
    {
        if (seconds === null) {
            return;
        }

        var time = new Date(_baseDate.valueOf() + (seconds*1000));

        if (isNaN(time.getTime())) {
            return;
        }

        if ($.type(_settings.timeFormat) === "function") {
            return _settings.timeFormat(time);
        }

        var output = '';
        var hour, code;
        for (var i=0; i< _settings.timeFormat.length; i++) {

            code = _settings.timeFormat.charAt(i);
            switch (code) {

                case 'a':
                    output += (time.getHours() > 11) ? _lang.pm : _lang.am;
                    break;

                case 'A':
                    output += (time.getHours() > 11) ? _lang.PM : _lang.AM;
                    break;

                case 'g':
                    hour = time.getHours() % 12;
                    output += (hour === 0) ? '12' : hour;
                    break;

                case 'G':
                    hour = time.getHours();
                    if (seconds === _ONE_DAY) hour = 24;
                    output += hour;
                    break;

                case 'h':
                    hour = time.getHours() % 12;

                    if (hour !== 0 && hour < 10) {
                        hour = '0'+hour;
                    }

                    output += (hour === 0) ? '12' : hour;
                    break;

                case 'H':
                    hour = time.getHours();
                    if (seconds === _ONE_DAY) hour = 24;
                    output += (hour > 9) ? hour : '0'+hour;
                    break;

                case 'i':
                    var minutes = time.getMinutes();
                    output += (minutes > 9) ? minutes : '0'+minutes;
                    break;

                case 's':
                    seconds = time.getSeconds();
                    output += (seconds > 9) ? seconds : '0'+seconds;
                    break;

                case '\\':
                    // escape character; add the next character and skip ahead
                    i++;
                    output += format.charAt(i);
                    break;

                default:
                    output += code;
            }
        }

        return output;
    }

    function _time2int(timeString)
    {
        if (timeString === '') return null;
        if (!timeString || timeString+0 == timeString) return timeString;


        if (typeof(timeString) == 'object') {
            return timeString.getHours()*3600 + timeString.getMinutes()*60 + timeString.getSeconds();
        }

        timeString = timeString.toLowerCase().replace('.', '');

        // if the last character is an "a" or "p", add the "m"
        if (timeString.slice(-1) == 'a' || timeString.slice(-1) == 'p') {
            timeString += 'm';
        }

        var ampmRegex = '(' +
            _lang.am.replace('.', '')+'|' +
            _lang.pm.replace('.', '')+'|' +
            _lang.AM.replace('.', '')+'|' +
            _lang.PM.replace('.', '')+')?';

        // try to parse time input
        var pattern = new RegExp('^'+ampmRegex+'\\s*([0-2]?[0-9])\\W?([0-5][0-9])?\\W?([0-5][0-9])?\\s*'+ampmRegex+'$');

        var time = timeString.match(pattern);
        if (!time) {
            return null;
        }

        var hour = parseInt(time[2]*1, 10);
        var ampm = time[1] || time[5];
        var hours = hour;

        if (hour <= 12 && ampm) {
            var isPm = (ampm == _lang.pm || ampm == _lang.PM);

            if (hour == 12) {
                hours = isPm ? 12 : 0;
            } else {
                hours = (hour + (isPm ? 12 : 0));
            }
        }

        var minutes = ( time[3]*1 || 0 );
        var seconds = ( time[4]*1 || 0 );
        var timeInt = hours*3600 + minutes*60 + seconds;

        // if no am/pm provided, intelligently guess based on the scrollDefault
        if (!ampm && _settings && _settings._twelveHourTime && _settings.scrollDefault) {
            var delta = timeInt - _settings.scrollDefault;
            if (delta < 0 && delta >= _ONE_DAY / -2) {
                timeInt = (timeInt + (_ONE_DAY / 2)) % _ONE_DAY;
            }
        }

        return timeInt;
    }


    function _duration2int(durationString){

        if (durationString === '') return 0;
        if (!durationString || durationString+0 == durationString) return durationString;


        if (typeof(durationString) == 'object') {
            return durationString.getHours()*3600 + durationString.getMinutes()*60 + durationString.getSeconds();
        }

        var regex = /(\d{1,2})\s(hrs|hr|mins|min)/gi;
        var match;
        var matches = [];
        while ((match = regex.exec(durationString)) != null) {
            if (match.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            matches.push(match)
        }

        var hrs = 0;
        var mints = 0;
        switch(matches.length)
        {
            case 0:
                return 0;
            break;

            case 1:
                // either only hours or mins
                // not both
                if(matches[0][2].substr(0,1).toLowerCase() == 'h'){
                    hrs = matches[0][1];
                }else{
                    mints = matches[0][1];
                }
            break;

            case 2:
                // both hours and minutes
                hrs = matches[0][1];
                mints = matches[1][1];
            break;
        }

        return hrs*3600 + mints*60;

        //console.log(_int2duration(timeInt));

    }




    function _pad2(n) {
        return ("0" + n).slice(-2);
    }


})(jQuery)