from flask import Flask, request, jsonify
import deezer
from flask_cors import CORS
import similarity
import requests
import io

app = Flask(__name__)
CORS(app)

model = None
index = None
metadata = None

@app.route('/song/')
def song():
  song = request.args.get('name')
  limit = 50
  if request.args.get('limit') != None:
    limit = request.args.get('limit')
  responses = deezer.retrieve_songs(song, limit)
  return jsonify(responses)

@app.route('/similar/')
def similar():
  preview_url = request.args.get('url')
  top_k = 5
  if request.args.get('top_k') != None:
    top_k = request.args.get('top_k')
  response = requests.get(preview_url, stream=True, timeout=10)
  response.raise_for_status()
  audio_data = io.BytesIO(response.content)
  responses = similarity.query_similar_songs(audio_data, index, metadata, model, top_k)
  return jsonify(responses)

if __name__ == '__main__':
  init_obj = similarity.init_model()
  model = init_obj['model']
  index = init_obj['index']
  metadata = init_obj['metadata']

  app.run(debug=True)