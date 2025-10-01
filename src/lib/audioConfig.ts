export interface AudioTrack {
  id: string
  name: string
  filename: string
  description?: string
}

export const audioTracks: AudioTrack[] = [
  {
    id: 'track-01',
    name: 'Focus Flow',
    filename: 'track-01.mp3',
    description: 'Ambient sounds for deep focus'
  },
  {
    id: 'track-02',
    name: 'Morning Energy',
    filename: 'track-02.mp3',
    description: 'Uplifting beats to start your session'
  },
  {
    id: 'track-03',
    name: 'Rain & Thunder',
    filename: 'track-03.mp3',
    description: 'Natural rain sounds with distant thunder'
  },
  {
    id: 'track-04',
    name: 'Ocean Waves',
    filename: 'track-04.mp3',
    description: 'Calming ocean waves on the shore'
  },
  {
    id: 'track-05',
    name: 'Forest Birds',
    filename: 'track-05.mp3',
    description: 'Peaceful forest with bird songs'
  },
  {
    id: 'track-06',
    name: 'White Noise',
    filename: 'track-06.mp3',
    description: 'Pure white noise for concentration'
  },
  {
    id: 'track-07',
    name: 'Coffee Shop',
    filename: 'track-07.mp3',
    description: 'Ambient coffee shop atmosphere'
  },
  {
    id: 'track-08',
    name: 'Classical Piano',
    filename: 'track-08.mp3',
    description: 'Soft classical piano melodies'
  },
  {
    id: 'track-09',
    name: 'Lo-Fi Hip Hop',
    filename: 'track-09.mp3',
    description: 'Chill lo-fi beats for studying'
  },
  {
    id: 'track-10',
    name: 'Meditation Bells',
    filename: 'track-10.mp3',
    description: 'Tibetan singing bowls and bells'
  }
]

export const getTrackById = (id: string): AudioTrack | undefined => {
  return audioTracks.find(track => track.id === id)
}

export const getAudioPath = (filename: string): string => {
  return `/audio/${filename}`
}