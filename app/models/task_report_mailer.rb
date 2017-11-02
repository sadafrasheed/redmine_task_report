class TaskReportMailer < ActionMailer::Base

  include TaskReportsHelper

  layout 'mailer'
  #default from: Setting.mail_from

  def self.default_url_options
    Mailer.default_url_options
  end

  def notify_task_report(task_report, time_entries)
     @task_report = task_report
     @time_entries = time_entries

     short_leave = ""
     extra_hour = ""

     short_leave = "( - #{@task_report.total_short_leaves} ) " unless empty_time? @task_report.total_short_leaves
     extra_hour = "( + #{@task_report.total_extra_hours} ) " unless empty_time? @task_report.total_extra_hours

     report_day = @task_report.report_for_day.to_datetime
     subject = "#{User.current.name}'s Task Report #{short_leave}#{extra_hour}@ #{report_day.strftime("%a %b %d, %y")} #{@task_report.time_from.strftime("%l:%M%P")}-#{@task_report.time_to.strftime("%l:%M%P")}"

     from_email = Setting.mail_from.scan(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i)  

     mail(to: receiverEmail,
         subject: subject,
         reply_to: User.current.mail,
         from: "#{User.current.name}  <#{from_email[0]}>"
     )


  end

  def receiverEmail
    #TODO: get this from plugin settings
    #"sadaf@discretelogix.com"
    "attendance@discretelogix.com"
  end
end
