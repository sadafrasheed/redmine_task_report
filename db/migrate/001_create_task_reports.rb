class CreateTaskReports < ActiveRecord::Migration
  def change
    create_table :task_reports do |t|

      t.references :user

      t.date :report_for_day

      t.time :time_from

      t.time :time_to

      t.string :total_working_hours, :limit => 10

      t.string :total_logged_hours, :limit => 10

      t.string :total_short_leaves, :limit => 10

      t.string :total_extra_hours, :limit => 10

      t.string :total_free_hours, :limit => 10

      t.boolean :worked_from_home

      t.text :wfh_reason

      t.text :remarks


    end

    add_index :task_reports, :user_id

  end
end
