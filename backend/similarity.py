import numpy as np
import torch
import faiss
import librosa
from audioset_tagging_cnn.pytorch.models import Cnn14

def preprocess_audio(file_path, sample_rate=32000):
  waveform, _ = librosa.load(file_path, sr=sample_rate, mono=True)
  waveform = torch.Tensor(waveform).unsqueeze(0)
  return waveform

def query_similar_songs(file_path, index_path, metadata_path, model, top_k=5):
  index = faiss.read_index(index_path)
  with open(metadata_path, 'rb') as f:
    metadata = np.load(f, allow_pickle=True).tolist()

  processed_audio = preprocess_audio(file_path)
  if processed_audio is None:
    return []

  with torch.no_grad():
    output_dict = model(processed_audio)
    embedding = output_dict['embedding'].cpu().numpy().squeeze()

  if embedding.shape[0] != index.d:
    print(f"Dimension mismatch: embedding size {embedding.shape[0]} does not match FAISS index dimension {index.d}.")
    return []

  distances, indices = index.search(np.expand_dims(embedding, axis=0), top_k)

  similar_songs = [{
    'title': metadata[i]['title'],
    'artist': metadata[i]['artist'],
    'distance': distances[0][j]
  } for j, i in enumerate(indices[0])]

  return similar_songs

if __name__ == "__main__":    
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
  file_path = "august.m4a"
  index_path = "faiss_index.bin"
  metadata_path = "metadata.npy"

  results = query_similar_songs(file_path, index_path, metadata_path, model, top_k=5)
  print("Similar songs:")
  for song in results:
    print(f"Title: {song['title']}, Artist: {song['artist']}, Distance: {song['distance']:.4f}")
