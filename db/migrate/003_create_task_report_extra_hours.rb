class CreateTaskReportExtraHours < ActiveRecord::Migration
  def change
    create_table :task_report_extra_hours do |t|

      t.references :task_report

      t.references :user

      t.date :worked_on

      t.time :start_time

      t.time :end_time


    end

  end
end
