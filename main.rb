require 'rubygems'
require 'rdiscount'
require 'haml'
require 'sinatra'

get '/' do
    haml :refactor
end

get '/data/:model.:format' do
    content_type :json
    File.read(File.expand_path(File.join('data', "#{params[:model]}.#{params[:format]}"), File.dirname(__FILE__)))
end
