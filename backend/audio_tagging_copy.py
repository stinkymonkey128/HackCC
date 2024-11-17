import torch
import librosa
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from audioset_tagging_cnn.pytorch.models import Cnn14

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

checkpoint = torch.load('Cnn14_mAP=0.431.pth', map_location='cpu')
model.load_state_dict(checkpoint['model'])
model.eval()

def generate_embedding(file_path):
  (waveform, _) = librosa.load(file_path, sr=32000, mono=True)
  waveform = waveform[None, :]

  waveform = torch.Tensor(waveform)
  print(waveform)

  with torch.no_grad():
    output_dict = model(waveform)
    embedding = output_dict['embedding'].cpu().numpy().squeeze()
  return embedding

file_path1 = 'temp_audio.mp3'
file_path2 = 'needed_me.m4a'

embedding1 = generate_embedding(file_path1)
embedding2 = generate_embedding(file_path2)

similarity = cosine_similarity([embedding1], [embedding2])

print(f'{embedding1}\n{embedding2}')
print(f'Cosine similarity between the two audio files: {similarity}')
