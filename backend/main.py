from flask import Flask, request, jsonify
import deezer
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/song/')
def home():
  song = request.args.get('name')
  limit = 50
  if request.args.get('limit') != None:
    limit = request.args.get('limit')
  responses = deezer.retrieve_songs(song, limit)
  return jsonify(responses)

if __name__ == '__main__':
  app.run(debug=True)