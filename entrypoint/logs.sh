#!/bin/bash

cp /opt/logs/rsyslog.conf /etc/rsyslog.conf
cp /opt/logs/logrotate.conf /etc/logrotate.conf

# create empty logs
touch /var/log/access.log
touch /var/log/error.log
touch /var/log/jobs.log

# setup logrotate
replace_in_file "/etc/logrotate.conf" "%LOGROTATE_MAXAGE%" "$LOGROTATE_MAXAGE"
replace_in_file "/etc/logrotate.conf" "%LOGROTATE_MINSIZE%" "$LOGROTATE_MINSIZE"
echo "$LOGROTATE_CRON /opt/scripts/logrotate.sh > /dev/null 2>&1" >> /etc/crontabs/root