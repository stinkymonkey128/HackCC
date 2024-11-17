import requests as r

genres = {
  'Pop': 132, 
  'Rap/Hip Hop': 116, 
  'Reggaeton': 122, 
  'Rock': 152, 
  'Dance': 113, 
  'R&B': 165, 
  'Alternative': 85, 
  #'Christian': 186, 
  'Electro': 106, 
  'Folk': 466, 
  'Reggae': 144, 
  'Jazz': 129, 
  'Country': 84, 'Salsa': 67, 'Traditional Mexicano': 65, 'Classical': 98, 'Films/Games': 173, 'Metal': 464, 'Soul & Funk': 169, 'African Music': 2, 'Asian Music': 16, 'Blues': 153, 'Brazilian Music': 75, 'Cumbia': 71, 'Indian Music': 81, 'Kids': 95, 'Latin Music': 197}

def retrieve_songs(song_name: str, limit=50):
  responses = r.get(f'https://api.deezer.com/search?q={song_name}&limit={limit}')
  if responses.status_code != 200:
    return 0, None
  
  responses = responses.json()['data']

  pure = []
  for response in responses:
    song_info = {
      'title': response.get('title'),
      'albumTitle': response.get('album', {}).get('title'),
      'artist': response.get('artist', {}).get('name'),
      'year': {},
      'previewUrl': response.get('preview'),
      'albumCoverUrl': response.get('album', {}).get('cover_big'),
      'id': response.get('id', {})
    }
    pure.append(song_info)

  return pure

def retrieve_song_by_id(id: str):
  response = r.get(f'https://api.deezer.com/track/{id}')
  if response.status_code != 200:
    return 0, None
  
  response = response.json()

  return {
    'title': response.get('title'),
    'albumTitle': response.get('album', {}).get('title'),
    'artist': response.get('artist', {}).get('name'),
    'year': {},
    'previewUrl': response.get('preview'),
    'albumCoverUrl': response.get('album', {}).get('cover_big'),
    'id': response.get('id', {})
  }

def retrieve_genres():
  response = r.get('https://api.deezer.com/genre/')
  
  if response.status_code != 200:
    return None
  
  data = response.json()
  genres = data.get('data', [])
  
  genre_dict = {genre['name']: genre['id'] for genre in genres if genre['name'] != 'All'}
  return genre_dict

def retrieve_chart(genre: str, limit=300):
  response = r.get(f'https://api.deezer.com/chart/{genres[genre]}?limit={limit}')

  if response.status_code != 200:
    return None
  
  data = response.json()
  chart_data = []

  for track in data.get('tracks', {}).get('data', []):
    track_info = {
      'title': track.get('title'),
      'albumTitle': track.get('album', {}).get('title'),
      'artist': track.get('artist', {}).get('name'),
      'year': track.get('album', {}).get('release_date', '').split('-')[0],
      'previewUrl': track.get('preview'),
      'albumCoverUrl': track.get('album', {}).get('cover_big'),
      'id': response.get('id', {})
    }
    chart_data.append(track_info)

  return chart_data