import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

import pandas as pd

from flask import Flask, jsonify, render_template
from flask_cors import CORS

from config import pwd
import json


rds_connection_string = f"postgres:{pwd}@localhost:5432/Proj2_AirlineAccidents"
engine = create_engine(f'postgresql://{rds_connection_string}')

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
airplane_events = Base.classes.airplane_events_clean


app = Flask(__name__)
CORS(app)

# Flask Routes to render HTML
@app.route("/")
def home():
    """Return the homepage."""
    return render_template("index.html")

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
     return jsonify(accident_dict)

@app.route("/monthly")
def Monthly():
    monthly_accidents = engine.execute ('''Select Extract (Month from event_date) AS monthid
		                                    , TO_CHAR (event_date, 'Month') AS monthname
		                                    , count (event_id) as accidents
		                                    , sum (fatalities) as fatalities
	                                        from	airplane_events_clean
                                            group by Extract (Month from event_date), TO_CHAR (event_date, 'Month')
                                            order by Extract (Month from event_date)''')
    results= []
    results = [list(row) for row in monthly_accidents]
    test = []
    for x in range(0, len(results)):
        result_dict = {'monthid':results[x][0], 'monthname': results[x][1], 'accidents': results[x][2], 'fatalities': results[x][3] }
        test.append(result_dict)
    return jsonify(test)     

@app.route("/by_airport")
def by_airport(): 
    accidents_by_airport = engine.execute('''SELECT aec.airport_code, ac.airport_name, ac.latitude, ac.longitude, ac.city, ac.country
                                            , count (aec.event_id) as accidents_total, sum(aec.fatalities) as fatalities_total
                                        FROM airplane_events_clean aec
                                        inner join airport_coordinates ac on
                                                aec.airport_code = ac.airport_code
                                        group by aec.airport_code, ac.airport_name, ac.latitude, ac.longitude, ac.city, ac.country
                                        having sum(aec.fatalities) > 0''')
    results= []
    results = [list(row) for row in accidents_by_airport]
    test = []
    for x in range(0, len(results)):
        result_dict = {'airport_code':results[x][0], 'airport_name': results[x][1], 'latitude': (str(results[x][2])), 'longitude': (str(results[x][3])), 'accidents': results[x][4], 'fatalities': results[x][5]}

        test.append(result_dict)
    return jsonify(test)


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
        result_dict = {'Flight Phase':results[x][0], 'Uninjured': results[x][1], 'Injuries': results[x][3], 'Fatalities': results[x][2] }
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
        result_dict = {'Flight Phase':results[x][0], 'Weather Condition': results[x][1], 'Fatal': results[x][2], 'Injuries': results[x][3] }
        test.append(result_dict)
    return jsonify(test)

if __name__ == '__main__':
    app.run(debug=True)
