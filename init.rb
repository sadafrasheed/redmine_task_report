
require 'redmine'


Redmine::Plugin.register :redmine_task_report do
  name 'Redmine Task Report plugin'
  author 'Discretelogix Pvt Ltd'
  description 'Redmine Plugin that automatically creates task reports from logged hours.'
  version '0.1'
  url 'http://pdb.discretelogix.org'
  author_url 'http://www.discretelogix.com'

  menu :top_menu, 'Task Reports', { :controller => 'task_reports', :action => 'index' }, :caption => 'Task Reports', :if =>  Proc.new { User.current.logged? }

  menu :top_menu, 'Daily Task Reports', { :controller => 'task_reports', :action => 'daily' }, :caption => 'Daily Task Reports', :if =>  Proc.new { User.current.admin }

  settings :default => {'empty' => true}, :partial => 'settings/task_report_settings'
end

