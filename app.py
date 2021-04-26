import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

import pandas as pd

from flask import Flask, jsonify, render_template
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



if __name__ == '__main__':
    app.run(debug=True)
