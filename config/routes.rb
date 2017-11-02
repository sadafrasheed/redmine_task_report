# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

#get 'task_reports/new', :to => 'task_reports#new'
#post 'task_reports/create'

get 'task_reports/daily', :to => 'task_reports#daily'
resources :task_reports

