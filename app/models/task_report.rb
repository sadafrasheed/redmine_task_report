class TaskReport < ActiveRecord::Base
  include Redmine::SafeAttributes
  unloadable




  belongs_to :user
  has_many :task_report_short_leaves, class_name: 'TaskReportShortLeave'
  has_many :task_report_extra_hours


  accepts_nested_attributes_for :task_report_short_leaves, :reject_if => lambda { |a| a[:start_time].blank? }, :allow_destroy => true
  accepts_nested_attributes_for :task_report_extra_hours, :reject_if => lambda { |a| a[:start_time].blank? }, :allow_destroy => true

  safe_attributes 'report_for_day', 'time_from', 'time_to', 'total_working_hours','total_logged_hours', 'total_short_leaves', 'total_extra_hours','total_free_hours', 'remarks'


  def self.search(params)

  end




end
