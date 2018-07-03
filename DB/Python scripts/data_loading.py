#!/bin/python
# -*- coding: utf-8 -*-

# Script to load the data supplied by the Greek Forum of Migrants
# into the database.
#
# It uses mysql.connector, you can download it from
# https://dev.mysql.com/downloads/connector/python/
#
# Author: David Campos Rodríguez <david.campos.r96@gmail.com>

import csv
import sys

try:
    import mysql.connector
except ImportError:
    print("Couldn't import mysql.connector, you can download it from")
    print("https://dev.mysql.com/downloads/connector/python/")
    sys.exit(1)


def insert_item(crs, item):
    add_item = ("INSERT INTO items"
                "(name, address, web_link, place_id, icon_uri,is_free,coord_lat,coord_lon,"
                "phone,call_for_appointment,category_code) "
                "VALUES (%(name)s, %(addr)s, %(link)s, %(place)s, %(icon)s, %(free)s,%(lat)s,%(lon)s,"
                "%(phone)s,%(cfapp)s,%(category)s)")
    crs.execute(add_item, item)
    return crs.lastrowid


def insert_period(crs, period):
    add_item = ("INSERT INTO opening_hours"
                "(start_day, end_day, start_hour, end_hour, start_minutes, end_minutes, item_id) "
                "VALUES (%(ini_d)s, %(end_d)s, %(ini_h)s, %(end_h)s, %(ini_m)s, %(end_m)s, %(item)s)")
    crs.execute(add_item, period)
    return crs.lastrowid


def category_for(cursor, item_type, field_value):
    field_value = field_value.strip()
    query = "SELECT category_code FROM categories WHERE name = %s AND item_type = %s"
    cursor.execute(query, (field_value, item_type))
    rows = cursor.fetchall()
    if cursor.rowcount < 1:
        print("category_for: Error, rowcount = ", cursor.rowcount, " < 1 for ", field_value, " with item_type ", item_type)
        print(cursor.fetchall())
        sys.exit(1)
    return rows[0][0]


def languages_for(lang):
    languages = {
        'greek': 'el',
        'english': 'en',
        '': 'en'  # let's use 'english' for the empty ones
    }
    langs = lang.split(',')
    result = []
    for ln in langs:
        ln = ln.strip().lower()
        if ln not in languages:
            print("language_for: Error, invalid language: ", ln)
            sys.exit(1)
        result.append(languages[ln])
    return result


def parse_hour(hour_str):
    hour_str = hour_str.strip().lower()
    pm = hour_str.endswith("pm")
    hour_str = hour_str.replace("am", "").replace("pm", "")
    m0 = 0
    if ':' in hour_str:
        (h0, m0) = hour_str.split(':')
        h0 = int(h0)
        m0 = int(m0)
    else:
        h0 = int(hour_str)

    if pm:
        h0 = h0 + 12
    return h0, m0


def day_enum_for(day_str):
    day_enum = day_str.strip().lower()[:3]
    if day_enum not in ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'):
        print("Error, unrecognised day: ", day_str, " => ", day_enum)
        sys.exit(1)
    return day_enum


def day_list(value):
    # DayList  -> WeekDay ("," WeekDay)* | WeekDay "-" WeekDay
    value = value.strip().replace(" ", "")

    days = ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    linePos = value.find("-")
    if linePos != -1:
        day_start = value[:linePos].strip().lower()
        day_end = value[linePos+1:].strip().lower()
        if day_start in days and day_end in days:
            start = days.index(day_start)
            end = days.index(day_end)
            result = []
            if start < end:
                for i in range(start, end+1):
                    result.append(days[i])
            else:
                for i in range(end, len(days)):
                    result.append(days[i])
                for i in range(start):
                    result.append(days[i])
            return result
        else:
            print('Error, unknown days in range: ', day_start, '-', day_end)
            sys.exit(1)
    else:
        week_days = value.split(',')
        result = []
        for week_day in week_days:
            week_day = week_day.strip().lower()
            if week_day in days:
                result.append(week_day)
            else:
                print('Error, unknown day in list: ', week_day)
                sys.exit(1)
        return result


def hour_range(value):
    # HourRange -> Hour ":" Minutes ("am"|"pm") "-" Hour ":" Minutes ("am"|"pm")
    value = value.strip().replace(" ", "")

    hours = value.split('-')
    if len(hours) != 2:
        print("Error, cannot parse hours (no '-'): ", value)
        sys.exit(1)

    (h0, m0) = parse_hour(hours[0])
    (hf, mf) = parse_hour(hours[1])
    return [[h0, m0], [hf, mf]]


def schedule(value):
    # Schedule -> DayList " " HourRange ("&" HourRange)*
    value = value.strip()

    spacePos = value.find(" ")
    if spacePos == -1:
        print("Error, invalid schedule (no space): ", value)
        sys.exit(1)
    daylist = value[:spacePos]
    rest = value[spacePos+1:]
    d_l = day_list(daylist)
    hour_ranges = rest.split("&")
    hour_pairs = []
    for h_r in hour_ranges:
        hour_pairs.append(hour_range(h_r))

    # now we create all the resulting "periods" to return
    result = []
    for day in d_l:
        for hour_pair in hour_pairs:
            result.append({
                'ini_d': day_enum_for(day),
                'end_d': day_enum_for(day),
                'ini_h': hour_pair[0][0], 'ini_m': hour_pair[0][1],
                'end_h': hour_pair[1][0], 'end_m': hour_pair[1][1]
            })
    return result


def hours_for(field_value):
    field_value = field_value.strip().lower()
    if field_value == "":
        return []

    if field_value.startswith('appointment'):
        return []  # no hours cause we have to call
    else:
        # The format will be the following:
        # S        -> Schedule (";" Schedule) *
        # Schedule -> DayList " " HourRange ("&" HourRange)*
        # DayList  -> WeekDay ("," WeekDay)* | WeekDay "-" WeekDay
        # HourRange -> Hour ":" Minutes ("am"|"pm") "-" Hour ":" Minutes ("am"|"pm")
        schedules = field_value.split(';')
        periods_list = []
        for sched in schedules:
            periods_list += schedule(sched)
        print("Periods:", periods_list)
        return periods_list


def call_for_appointment(hours):
    hours = hours.strip().lower()
    if hours.startswith("appointment"):
        return True
    else:
        return False


def get_phone(hours):
    hours = hours.strip().lower()
    if hours.startswith("appointment"):
        idx = hours.find("(")+1
        idxEnd = hours.find(")")
        return hours[idx:idxEnd]
    else:
        return None


def load(items_type, file_fields, cursor, def_cat=''):
    print("Inserting " + items_type + "...")
    info_file = input(items_type + "s csv file: ")
    with open(info_file, 'r') as csvfile:
        csvreader = csv.DictReader(csvfile, delimiter=',', quotechar='"', fieldnames=file_fields)
        for row in csvreader:
            print("\trow: ", row)
            coords = row['coordinates'].split(',')
            if coords != '' and len(coords) != 2 and 'coordinates' in file_fields:
                    print("Warning: coordinates not parsed: ", row['coordinates'])

            item = {
                'name': row['name'] if 'name' in file_fields else None,
                'addr': row['address'] if 'address' in file_fields else None,
                'link': row['web_link'] if 'web_link' in file_fields else None,
                'place': None,
                'icon': '',
                'free': (row['free'].lower() == 'free') if 'free' in file_fields else False,
                'lat': coords[0] if len(coords) == 2 else None,
                'lon': coords[1] if len(coords) == 2 else None,
                'phone': get_phone(row['hours']),
                'cfapp': call_for_appointment(row['hours']),
                'category': category_for(
                    cursor, items_type.lower(), row['category']) if 'category' in file_fields else def_cat
            }
            print("\titem: ", item)
            item_id = insert_item(cursor, item)
            hours = hours_for(row['hours'])

            for period in hours:
                period['item'] = item_id
                insert_period(cursor, period)

            langs = languages_for(row['language']) if 'language' in file_fields else []
            for ln in langs:
                print("\t\tlangs: ", ln)

    print(items_type + " inserted")

if sys.version_info < (3, 0):
    print("Python 3.0 or later required.")
    sys.exit(1)

# Obtain data
dbhost = input("Database host: ")
dbuser = input("Database user: ")
dbpassword = input("Database password: ")
dbdatabase = input("Database: ")

print("Connecting...")
try:
    cnx = mysql.connector.connect(
        user=dbuser, password=dbpassword, host=dbhost, database=dbdatabase)
except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Something is wrong with your user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print(err)
    sys.exit(1)

print("Connected.")
crsr = cnx.cursor()

#load('Info',
#     ('name', 'category', 'address', 'web_link', 'hours', 'language', 'free', 'coordinates'), crsr)
load('Leisure',
     ('category', 'name', 'address', 'web_link', 'hours', 'language', 'free', 'coordinates'), crsr)
#load('Help',
#     ('name', 'web_link', 'c', 'd', 'e', 'f', 'g', 'language', 'free'), crsr, 'help_help_')
#load('Link',
#     ('category', 'name', 'address', 'web_link', 'hours', 'language', 'free', 'coordinates'), crsr)
#load('Service',
#     ('category', 'name', 'address', 'web_link', 'hours', 'language', 'free', 'coordinates'), crsr)

cnx.commit()
crsr.close()
cnx.close()
print("Done.")
