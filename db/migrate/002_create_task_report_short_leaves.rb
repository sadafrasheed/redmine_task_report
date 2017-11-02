class CreateTaskReportShortLeaves < ActiveRecord::Migration
  def change
    create_table :task_report_short_leaves do |t|

      t.references :task_report

      t.references :user

      t.date :leave_on

      t.time :start_time

      t.time :end_time


    end

  end
end
