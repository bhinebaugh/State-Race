require 'rubygems'
require 'rdiscount'
require 'json'
require 'compass'
require 'haml'
require 'sinatra'

get '/' do
    haml :refactor
end

get '/data/:model.:format' do
    content_type :json
    File.read(File.expand_path(File.join('data', "#{params[:model]}.#{params[:format]}"), File.dirname(__FILE__)))
end

# Stylesheets

helpers do
    def sass(template, *args)
        template = :"#{settings.sass_dir}/#{template}" if template.is_a? Symbol
        super(template, *args)
    end
end

set :sass_dir, '../sass'

get '/css/main.css' do
    sass :main
end
