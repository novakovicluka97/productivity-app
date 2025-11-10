export interface AudioTrack {
  id: string
  name: string
  filename: string
  description?: string
}

export const audioTracks: AudioTrack[] = [
  {
    id: 'track-01',
    name: 'Gentle Rain',
    filename: 'rain.mp3',
    description: 'Soothing rainfall for focus and relaxation'
  },
  {
    id: 'track-02',
    name: 'Ocean Waves',
    filename: 'ocean.mp3',
    description: 'Calming ocean waves on the shore'
  },
  {
    id: 'track-03',
    name: 'Forest Birds',
    filename: 'birds.mp3',
    description: 'Peaceful forest with bird songs'
  },
  {
    id: 'track-04',
    name: 'Crackling Fireplace',
    filename: 'fireplace.mp3',
    description: 'Warm fireplace sounds for cozy focus'
  },
  {
    id: 'track-05',
    name: 'Thunder & Rain',
    filename: 'thunder.mp3',
    description: 'Distant thunder with gentle rainfall'
  },
  {
    id: 'track-06',
    name: 'Gentle Wind',
    filename: 'wind.mp3',
    description: 'Soft breeze for peaceful concentration'
  },
  {
    id: 'track-07',
    name: 'Coffee Shop Ambience',
    filename: 'cafe.mp3',
    description: 'Ambient coffee shop atmosphere'
  },
  {
    id: 'track-08',
    name: 'Rainy Day',
    filename: 'rain2.mp3',
    description: 'Quiet rainfall ambience'
  },
  {
    id: 'track-09',
    name: 'White noise',
    filename: 'white-noise.mp3',
    description: 'White noise'
  }
]

export const getTrackById = (id: string): AudioTrack | undefined => {
  return audioTracks.find(track => track.id === id)
}

export const getAudioPath = (filename: string): string => {
  return `/audio/${filename}`
}