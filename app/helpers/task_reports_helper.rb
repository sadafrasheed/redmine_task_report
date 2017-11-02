module TaskReportsHelper

  def decimal_to_time (number)
    # input number can be some thing like 4.25
    # returns array with two elements hours and minutes

    time = "#{number}".split(".")
    min = time[1].length <= 1? "#{time[1]}0":"#{time[1]}"
    min = (min.to_i * 60 / 100).round
    min = (min/5).round * 5
    time[1] = min

    return time
  end



  def empty_time? (time)
    time.blank? or time == "0 mins" or time == "0 min"
  end

  def hours_empty? (hours)
    #puts hours
    #puts hours.to_i
    #puts "===================================================="
    return true if hours.blank?
    return true if hours.to_f == 0
    return true if hours == "0"
    return true if hours == "0.0"
    return false
  end


  def unsubmitted_report_status (obj_date)
    return "Off day" if off_day? obj_date
    "Pending"
  end


  def off_day? obj_date
    return false
    # TODO: add off days in settings of plugin
    # and then check if that day was off or not
    if obj_date.saturday? or obj_date.sunday?
      true
    else
      false
    end
  end


  def modification_time_expired? obj_date    	
    #puts "============================================"
    #puts obj_date

    days_limit = 30.days.ago.to_date

    #puts days_limit

    Date.today.downto(days_limit) do |dt|
      days_limit = days_limit - 1.day if off_day? dt
    end

    #puts days_limit
    #puts "=========================================="

    obj_date < days_limit
  end

  def compare_hours str_hours
    return nil unless str_hours
    return -1 if str_hours == "0" #only possible if someone manages to submit task report without logging any hours
    #puts "---------------------------"
    #puts str_hours

    arr = str_hours.scan(/(\d{1,2})\s(hrs|hr|mins|min)/)
    #puts arr.inspect
    #puts "---------------------------"
    if(arr[0][1] == "hrs" or arr[0][1] == "hr")
      return 1 if arr[0][0].to_i >= (required_office_hours - 1)
      return -1 if arr[0][0].to_i < (required_office_hours - 1)
    end
    if(arr[0][1] == "mins" or arr[0][1] == "min")
      return -1
    end
  end


  #===============================================
  # Settings related methods.....

  def can_view_others_reports?
    true
  end

  def required_office_hours
    9
  end

end
