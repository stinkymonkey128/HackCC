import faiss
import numpy as np
import torch
import deezer as deezer
from audioset_tagging_cnn.pytorch.models import Cnn14
import librosa
import time
import requests
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm
import os

sample_rate = 32000
window_size = 1024
hop_size = 320
mel_bins = 64
fmin = 50
fmax = 14000
classes_num = 527

model = Cnn14(
  sample_rate=sample_rate,
  window_size=window_size,
  hop_size=hop_size,
  mel_bins=mel_bins,
  fmin=fmin,
  fmax=fmax,
  classes_num=classes_num
)

# https://zenodo.org/records/3987831/files/Cnn14_mAP%3D0.431.pth?download=1
checkpoint = torch.load('Cnn14_mAP=0.431.pth', map_location='cpu')
model.load_state_dict(checkpoint['model'])
model.eval()

embedding_dim = 2048
index = faiss.IndexFlatL2(embedding_dim)
metadata = []

def preprocess_audio(file_path, sample_rate=32000):
  waveform, sr = librosa.load(file_path, sr=sample_rate, mono=True)
  mel_spec = librosa.feature.melspectrogram(
    y=waveform,
    sr=sample_rate,
    n_fft=1024,
    hop_length=512,
    n_mels=128
  )
  mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
  mel_spec_db = (mel_spec_db - mel_spec_db.min()) / (mel_spec_db.max() - mel_spec_db.min())
  mel_tensor = torch.tensor(mel_spec_db).unsqueeze(0).unsqueeze(0)
  return mel_tensor

def dap_audio(preview_url, sample_rate=32000):
  try:
    response = requests.get(preview_url, stream=True, timeout=10)
    if response.status_code != 200:
      print(f"Failed to download audio from {preview_url}")
      return None

    with open("temp_audio.mp3", "wb") as temp_file:
      for chunk in response.iter_content(chunk_size=1024):
        temp_file.write(chunk)

    waveform, _ = librosa.load('temp_audio.mp3', sr=sample_rate, mono=True)
    waveform = torch.Tensor(waveform).unsqueeze(0)
    return waveform
  except Exception as e:
    print(f"Error processing audio: {e}")
    return None

def generate_embedding(preview_url):
  processed_audio = dap_audio(preview_url)
  if processed_audio is None:
    return None
  with torch.no_grad():
    output_dict = model(processed_audio)
    embedding = output_dict['embedding'].cpu().numpy().squeeze()
    print(f"Generated embedding shape: {embedding.shape}")
  return embedding

def save_faiss_index_and_metadata():
  index_file = "faiss_index.bin"
  metadata_file = "metadata.npy"

  faiss.write_index(index, index_file)

  with open(metadata_file, 'wb') as f:
    np.save(f, metadata, allow_pickle=True)

  print("FAISS index and metadata saved.")


def add_to_faiss_parallel(genre):
  chart_songs = deezer.retrieve_chart(genre)
  if not chart_songs:
    print(f"Failed to retrieve chart for genre: {genre}")
    return

  with ThreadPoolExecutor(max_workers=5) as executor:
    list(tqdm(executor.map(add_song_to_index, chart_songs), total=len(chart_songs), desc=f"Processing {genre}"))

  print(f"Completed processing for genre: {genre}")


def add_song_to_index(song):
  embedding = None
  try:
    embedding = generate_embedding(song['previewUrl'])
    if embedding is None:
      raise ValueError(f"Failed to generate embedding for {song['title']}")

    if embedding.shape[0] != index.d:
      raise ValueError(f"Dimension mismatch for {song['title']} by {song['artist']}")

    index.add(np.expand_dims(embedding, axis=0))
    metadata.append(song)
  except Exception as e:
    print(f"Error adding song {song['title']} by {song['artist']}: {e}")
  finally:
    torch.cuda.empty_cache()


try:
  if not os.path.exists("faiss_index.bin"):
    index = faiss.IndexFlatL2(embedding_dim)
    faiss.write_index(index, "faiss_index.bin")
    print('created a faiss bin')

  index = faiss.read_index("faiss_index.bin")
  with open("metadata.npy", 'rb') as f:
      metadata = np.load(f, allow_pickle=True).tolist()
  print("Loaded existing FAISS index and metadata.")
except FileNotFoundError:
  print("No existing FAISS index or metadata found. Starting fresh.")
  index = faiss.IndexFlatL2(embedding_dim)
  metadata = []

for genre in deezer.genres.keys():
  print(f"Processing genre: {genre}")
  add_to_faiss_parallel(genre)

save_faiss_index_and_metadata()

'''
# Load FAISS index and metadata
index = faiss.read_index('faiss_index.bin')
with open('metadata.npy', 'rb') as f:
    metadata = np.load(f, allow_pickle=True).tolist()

# Query for similar songs
def query_similar_songs(query_file_path, top_k=5):
    # Preprocess and get the query embedding
    processed_audio = preprocess_audio(query_file_path)
    query_embedding = torch.mean(processed_audio, dim=-1).squeeze(0).squeeze(0).numpy()
    
    # Search FAISS index
    distances, indices = index.search(np.expand_dims(query_embedding, axis=0), top_k)
    
    # Retrieve metadata for similar songs
    similar_songs = [{'title': metadata[i]['title'], 'artist': metadata[i]['artist'], 'distance': distances[0][j]}
                     for j, i in enumerate(indices[0])]
    
    return similar_songs

# Example query
query_results = query_similar_songs('backend/august.m4a')
print('Similar songs:')
for result in query_results:
    print(result)
'''