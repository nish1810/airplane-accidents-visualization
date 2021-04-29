import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

import pandas as pd

from flask import Flask, jsonify, render_template

import json


connection_string = "postgres:postgres@localhost:5432/Proj2_AirplaneAccidents"
engine = create_engine('postgresql://postgres:password@localhost/Proj2_AirplaneAccidents')
# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
airplane_events = Base.classes.airplane_events_clean

app = Flask(__name__)
app.config['DEBUG'] = True
app.config["TEMPLATES_AUTO_RELOAD"] = True




# Flask Routes to render HTML
@app.route("/")
def home():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/flight-phase")
def flight_phase():
    """Return the flight phase page."""
    return render_template("flight-phase.html")

@app.route("/flight-phase-weather")
def flight_phase_weather():
    """Return the flight phase weather page."""
    return render_template("flight-phase-weather.html")
@app.route("/data-table")
def data_table():
    return render_template("data-table.html")


@app.route("/api")
def Accidents():
     # Create our session (link) from Python to the DB
     session = Session(engine)

    # # Perform a query to retrieve the accident data 
     accident_data = session.query(airplane_events.event_id, airplane_events.investigation_type, airplane_events.event_date, airplane_events.location,\
         airplane_events.latitude, airplane_events.longitude, airplane_events.airport_code, airplane_events.airport_name, airplane_events.injury_severity, \
         airplane_events.aircraft_damage, airplane_events.aircraft_category, airplane_events.make, airplane_events.flight_purpose, airplane_events.air_carrier, \
         airplane_events.fatalities, airplane_events.injuries, airplane_events.uninjured, airplane_events.weather_condition, airplane_events.flight_phase).\
         order_by(airplane_events.event_date).all()

     session.close()

     accident_df = pd.DataFrame(accident_data, columns =['event_id', 'investigation_type', 'event_date', 'location', 'latitude','longitude', 'airport_code', \
         'airport_name', 'injury_severity', 'aircraft_damage', 'aircraft_category', 'make', 'flight_purpose', 'air_carrier', 'fatalities', 'injuries', 'uninjured', \
         'weather_condition', 'flight_phase'])

     #Need to convert latitude and longitude to string (stored as decimal in DB)
     accident_df['latitude'] = accident_df['latitude'].astype(str)
     accident_df['longitude'] = accident_df['longitude'].astype(str)

     accident_dict = accident_df.to_dict()
    # accident_dict = "I worked"
     return jsonify(accident_dict)

@app.route("/weather_impact")
def Weather():
    fatality_flight_phase = engine.execute('''SELECT flight_phase, SUM(uninjured) as UNINJURED, SUM(FATALITIES) as FATALITIES, SUM(injuries) as INJURIES 
                            FROM airplane_events_clean
                            GROUP BY flight_phase
                            ORDER BY flight_phase''')
    results= []
    results = [list(row) for row in fatality_flight_phase]
    test = []
    for x in range(0, len(results)):
        result_dict = {'FlightPhase':results[x][0], 'Uninjured': results[x][1], 'Injuries': results[x][3], 'Fatalities': results[x][2] }
        test.append(result_dict)
    return jsonify(test)

@app.route("/weather_flight_impact")
def Weather_flight_phase():
    weather_flight_phase = engine.execute('''SELECT flight_phase, airplane_events_clean.weather_condition, SUM(FATALITIES) as FATALITIES, SUM(injuries) as INJURIES FROM airplane_events_clean
WHERE weather_condition = 'IMC' or weather_condition = 'VMC'
GROUP BY flight_phase, weather_condition
ORDER BY flight_phase;''')
    results= []
    results = [list(row) for row in weather_flight_phase]
    test = []
    for x in range(0, len(results)):
        result_dict = {'FlightPhase':results[x][0], 'WeatherCondition': results[x][1], 'Fatal': results[x][2], 'Injuries': results[x][3] }
        test.append(result_dict)
    return jsonify(test)

    # accident_dict = "I worked"

@app.route("/data")
def data():
    data = engine.execute('''SELECT make, air_carrier, investigation_type, event_date, location, country, airport_name, injuries, fatalities, uninjured
FROM airplane_events_clean
ORDER BY event_date DESC LIMIT 2000;''')
    results= []
    results = [list(row) for row in data]
    test = []
    for x in range(0, len(results)):
        result_dict = {'Make':results[x][0], 'Air_carrier': results[x][1], 'Investigation_type': results[x][2], 'Date': results[x][3], 'Location': results[x][4], 'Country': results[x][5],
                       'Airport' : results[x][6], 'injuries': results[x][7], 'Fatalities' : results[x][8], 'Uninjured': results[x][9]}
        test.append(result_dict)
    return jsonify(test)

if __name__ == '__main__':
    app.run(debug=True)
