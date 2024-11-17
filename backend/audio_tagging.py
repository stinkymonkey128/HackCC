import torch
from audioset_tagging_cnn.pytorch.models import Cnn14
import librosa
import numpy as np

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

checkpoint = torch.load('backend/Cnn14_mAP=0.431.pth', map_location='cpu')
model.load_state_dict(checkpoint['model'])
model.eval()

def extract_embedding(audio):
    processed_audio = preprocess_audio(audio) 
    with torch.no_grad():
        embedding = model(processed_audio)
    return embedding

def preprocess_audio(file_path, sample_rate=32000):
    waveform, sr = librosa.load(file_path, sr=sample_rate)
    
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

file_path = 'backend/august.m4a'
processed_audio = preprocess_audio(file_path)
print(processed_audio.shape)

file_path = 'backend/needed.m4a'
processed_audio = preprocess_audio(file_path)
print(processed_audio.shape)