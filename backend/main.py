from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/song/')
def home():
  song = request.args.get('name')
  requested = requests.get(f'https://itunes.apple.com/search?term={song}&media=music&entity=song').json()
  return jsonify(requested)

if __name__ == '__main__':
  app.run(debug=True)