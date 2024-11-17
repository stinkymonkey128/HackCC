import torch
import librosa
from panns_inference import AudioTagging
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

at = AudioTagging(checkpoint_path=None, device='cpu')

def generate_embedding(file_path):
  (waveform, _) = librosa.load(file_path, sr=32000, mono=True)
  waveform = waveform[None, :]

  waveform = torch.Tensor(waveform)
  print(waveform)

  device = next(at.model.parameters()).device
  waveform = waveform.to(device)

  with torch.no_grad():
    output_dict = at.model(waveform)
    embedding = output_dict['embedding'].cpu().numpy().squeeze()
  return embedding

file_path1 = 'temp_audio.mp3'
file_path2 = 'needed_me.m4a'

embedding1 = generate_embedding(file_path1)
embedding2 = generate_embedding(file_path2)

similarity = cosine_similarity([embedding1], [embedding2])

print(f'{embedding1}\n{embedding2}')
print(f'Cosine similarity between the two audio files: {similarity[0][0]}')
