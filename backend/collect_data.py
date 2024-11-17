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

def dap_audio(preview_url, sample_rate=32000):
  temp_file_path = "temp_audio.mp3"
  try:
    response = requests.get(preview_url, stream=True, timeout=10)
    if response.status_code != 200:
      print(f"Failed to download audio from {preview_url}")
      return None

    with open(temp_file_path, "wb") as temp_file:
      for chunk in response.iter_content(chunk_size=1024):
        temp_file.write(chunk)

    waveform, _ = librosa.load(temp_file_path, sr=sample_rate, mono=True)
    waveform = torch.Tensor(waveform).unsqueeze(0)
    return waveform
  except Exception as e:
    print(f"Error processing audio: {e}")
    return None
  finally:
    if os.path.exists(temp_file_path):
      os.remove(temp_file_path)

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
  time.sleep(0.2)

save_faiss_index_and_metadata()