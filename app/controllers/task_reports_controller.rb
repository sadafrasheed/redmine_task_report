class TaskReportsController < ApplicationController
  unloadable


  #helper :gantt
  helper :issues
  helper :projects
  helper :queries

  include QueriesHelper
  include TaskReportsHelper


  def index

    @date_range = params[:date_range].blank? ?  "Last 30 Days" : params[:date_range]
    case params[:date_range]
      when "This Month"
        @to = Date.today
        @from = @to.at_beginning_of_month
      when "This Week"
        @to = Date.today
        @from = @to.at_beginning_of_week
      when "Last Week"
        @to = Date.today.at_beginning_of_week - 1.day
        @from = @to - 6.days
      when "Last Month"
        @to = Date.today.at_beginning_of_month - 1.day
        @from = @to - 1.month + 1.day
      when "Last 30 days"
        @from = 1.month.ago.to_date
        @to = Date.today
      else
        @from = params[:from_day].blank? ?  1.month.ago.to_date : params[:from_day].to_datetime
        @to = params[:to_day].blank? ?  Date.today : params[:to_day].to_datetime
    end

    if can_view_others_reports?
      @user_id = params[:user_id].blank? ? User.current.id : params[:user_id]

      @searchable_users = searchable_users

    else
      @user_id = User.current.id
    end


    task_reports = TaskReport.where("(report_for_day BETWEEN '#{@from.strftime("%Y-%m-%d")}' AND '#{@to.strftime("%Y-%m-%d")}') AND user_id='#{@user_id}' ").order("report_for_day DESC").all

    tmp = {}
    task_reports.each do |report|
      tmp[report.report_for_day] = report
    end

    #puts task_reports.inspect
    #puts tmp.inspect

    @task_reports = tmp


    @report_user = User.find(@user_id)


  end


  def edit
    @task_report = TaskReport.find(params[:id])

    return unless proceed_to_report?

    @task_report.time_from = @task_report.time_from.strftime("%l:%M%P")
    @task_report.time_to = @task_report.time_to.strftime("%l:%M%P")


    populate_report_time_entries

    unless @task_report.task_report_short_leaves
      @task_report.task_report_short_leaves.build
    end

    unless @task_report.task_report_extra_hours
      @task_report.task_report_extra_hours.build
    end

  end


  def show
    @task_report = TaskReport.find(params[:id])
    populate_report_time_entries
  end



  def new

    report_for_day = params[:report_for_day].blank? ? DateTime.now.strftime("%Y-%m-%d") : params[:report_for_day]

=begin
    @task_report = TaskReport.where(" report_for_day='#{report_for_day}' and user_id='#{User.current.id}' ").first

    if @task_report
      redirect_to task_report_path @task_report.id
    end
=end

    @task_report = TaskReport.new
    @task_report.user_id = User.current.id
    @task_report.report_for_day = report_for_day

    return unless proceed_to_report?

    populate_new_time_entries report_for_day

    @task_report.task_report_short_leaves.build
    @task_report.task_report_extra_hours.build

  end

  def create

    @task_report = TaskReport.new(task_report_params)
    @task_report.user_id = User.current.id
    #@task_report.safe_attributes = params[:task_report]

    @task_report.worked_from_home = false
    @task_report.wfh_reason = ""

    return unless proceed_to_report?

    if @task_report.save

      params[:task_report][:task_report_short_leaves_attributes].each do |key , sl|
        unless sl[:start_time].blank?
          short_leave = TaskReportShortLeave.new
          short_leave.task_report_id = @task_report.id
          short_leave.user_id = User.current.id
          short_leave.leave_on = DateTime.now.strftime("%Y-%m-%d")
          short_leave.start_time = sl[:start_time]
          short_leave.end_time = sl[:end_time]
          short_leave.save
        end
      end

      params[:task_report][:task_report_extra_hours_attributes].each do |key, eh|
        unless eh[:start_time].blank?
          extra_hour = TaskReportExtraHour.new
          extra_hour.task_report_id = @task_report.id
          extra_hour.user_id = User.current.id
          extra_hour.worked_on = DateTime.now.strftime("%Y-%m-%d")
          extra_hour.start_time = eh[:start_time]
          extra_hour.end_time = eh[:end_time]
          extra_hour.save
        end
      end

      populate_new_time_entries @task_report.report_for_day


      @time_entries.each do |entry|
        if params[:time_entry]["#{entry.issue_id}"]

          arr = params[:time_entry]["#{entry.issue_id}"]

            unless hours_empty?(arr[:hours])

              entry.safe_attributes = arr
              entry.spent_on = @task_report.report_for_day
              entry.save

            end


        end
      end
    end

    populate_report_time_entries
    TaskReportMailer.notify_task_report(@task_report,@time_entries).deliver
    redirect_to task_report_path @task_report.id

  end


  def daily
    @day = params[:day].blank? ? Date.today - 1.day : params[:day].to_date
    @task_reports = TaskReport.joins(:user).where("report_for_day = '#{@day.strftime("%Y-%m-%d")}'").order("user_id").all
  end


  def populate_new_time_entries date

    @time_entries = TimeEntry.order('created_on DESC').where("user_id='#{User.current.id}' and spent_on='#{date}'").all


    sub_sql = ""
    if @time_entries
      filter_issues = []
      @time_entries.each do |entry|
        filter_issues << entry.issue_id
      end
      if filter_issues.length > 0
        sub_sql = " `issues`.`id` NOT IN (#{ filter_issues.join ", " }) AND "
      end
    end

    # issues assigned to current user...

    closed = IssueStatus.where("is_closed = 1").first


    issues = Issue.joins(:project).order('created_on DESC').
        where("#{sub_sql} `assigned_to_id`='#{User.current.id}' AND `status_id` <> #{closed.id} AND `projects`.`status` = #{Project::STATUS_ACTIVE}").all

    issues.each do |issue|
      entry = TimeEntry.create(project_id: issue.project_id, user_id: User.current.id, issue_id: issue.id, spent_on: Time.new )
      entry.spent_on = Time.new
      entry.user_id = User.current.id
      entry.issue = issue
      @time_entries << entry
    end

  end


  def populate_report_time_entries
    @time_entries = TimeEntry.order('created_on DESC').where("user_id='#{@task_report.user_id}' and spent_on='#{@task_report.report_for_day}'").all
	#if @time_entries.length < 1
	#	populate_new_time_entries @task_report.report_for_day
	#end
  end


  def searchable_users
    User.where("`status`=1 AND `id` NOT IN (SELECT user_id FROM groups_users WHERE group_id=#{excluded_group})").order('firstname').all
  end

  def excluded_group
    (Group.where("`lastname` like 'DX-Clients'").first).id
  end



  def proceed_to_report?
    if @task_report.user_id != User.current.id
	redirect_to task_reports_path
        return false
    end

    if modification_time_expired? @task_report.report_for_day or off_day? @task_report.report_for_day
      redirect_to task_reports_path
      return false
    end

    task_report = TaskReport.where(" report_for_day='#{@task_report.report_for_day}' and user_id='#{@task_report.user_id}' ").first
    if task_report and !params[:action].eql? "edit" 
      redirect_to task_report_path task_report.id
      return false
    end

    return true

  end


  def task_report_params
	params.require(:task_report).permit(:report_for_day, :time_from, :time_to, :total_working_hours, :total_logged_hours, :total_short_leaves, :total_extra_hours, :total_free_hours, :worked_from_home, :wfh_reason, :remarks )
  end


end
