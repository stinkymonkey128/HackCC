import numpy as np
import torch
import faiss
from audioset_tagging_cnn.pytorch.models import Cnn14
from pydub import AudioSegment
import deezer

def preprocess_audio(audio_data, sample_rate=32000):
  audio = AudioSegment.from_file(audio_data)
  audio = audio.set_frame_rate(sample_rate).set_channels(1)
  waveform = np.array(audio.get_array_of_samples(), dtype=np.float32) / (2 ** 15)
  waveform = torch.Tensor(waveform).unsqueeze(0)
  return waveform

def query_similar_songs(file_path, index, metadata, model, top_k=5):
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
    'data': deezer.retrieve_song_by_id(metadata[i].id),
    'cosdist': float(distances[0][j])
   } for j, i in enumerate(indices[0])]

  return similar_songs

def init_model(model_path='Cnn14_mAP=0.431.pth', faiss_path='faiss_index.bin', metadata_path='metadata.npy'):
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
  checkpoint = torch.load(model_path, map_location='cpu')
  model.load_state_dict(checkpoint['model'])
  model.eval()

  metadata = None
  with open(metadata_path, 'rb') as f:
    metadata = np.load(f, allow_pickle=True).tolist()

  return {
    'model': model,
    'index': faiss.read_index(faiss_path),
    'metadata': metadata
  }