# Gemfile — Ruby gem dependencies for Fastlane
# This file ensures everyone uses the same Fastlane version.
# Run: bundle install

source "https://rubygems.org"

gem "fastlane", "~> 2.225"

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
