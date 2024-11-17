from flask import Flask, request, jsonify
from flask_cors import CORS
import faiss
import numpy as np
from your_audio_processing import generate_embedding  # Import your existing functions

app = Flask(__name__)
CORS(app)

# Load your FAISS index and metadata
index = faiss.read_index('faiss_index.bin')
with open('metadata.npy', 'rb') as f:
    metadata = np.load(f, allow_pickle=True).tolist()

@app.route('/song/', methods=['GET'])
def get_similar_songs():
    song_name = request.args.get('name')
    if not song_name:
        return jsonify({"error": "No song name provided"}), 400
    
    try:
        # Find the song in metadata
        query_song = next((song for song in metadata if song['title'].lower() == song_name.lower()), None)
        if not query_song:
            return jsonify({"error": "Song not found"}), 404

        # Generate embedding for the query song
        query_embedding = generate_embedding(query_song['previewUrl'])
        if query_embedding is None:
            return jsonify({"error": "Failed to generate embedding"}), 500

        # Search for similar songs
        k = 6  # Number of similar songs to return
        distances, indices = index.search(np.expand_dims(query_embedding, axis=0), k)

        # Get the similar songs' metadata
        similar_songs = []
        for i, idx in enumerate(indices[0]):
            song = metadata[idx]
            similar_songs.append({
                'title': song['title'],
                'artist': song['artist'],
                'albumTitle': song.get('albumTitle', ''),
                'albumCoverUrl': song.get('albumCoverUrl', ''),
                'previewUrl': song.get('previewUrl', ''),
                'year': song.get('year', ''),
                'similarity': float(distances[0][i])
            })

        return jsonify(similar_songs)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)