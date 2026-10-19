/**
 * SATB Composer Studio - 4-Voice Audio Player & Mixer Bar
 * Control transport playback, master & individual S/A/T/B volume, mute/solo,
 * instrument presets (Piano, Church Organ, Synthetic Choir), and tempo.
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Music,
  Repeat
} from 'lucide-react';
import { audioPlayer, InstrumentType, PlaybackState } from '../engine/audioEngine';
import { SATBScore, VoicePart } from '../types/music';

interface AudioPlayerBarProps {
  score: SATBScore;
  currentMeasure: number;
  onMeasureChange: (mNum: number) => void;
  onScoreUpdate?: (score: SATBScore) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  score,
  currentMeasure,
  onMeasureChange,
  onScoreUpdate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [instrument, setInstrument] = useState<InstrumentType>('organ');
  const [masterVolume, setMasterVolume] = useState(0.85);
  const [tempo, setTempo] = useState(score.metadata.tempoBpm || 84);
  const [showMixer, setShowMixer] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // Voice channel states
  const [channelVolumes, setChannelVolumes] = useState({
    soprano: 0.85,
    alto: 0.85,
    tenor: 0.85,
    bass: 0.9,
  });

  const [channelMutes, setChannelMutes] = useState({
    soprano: false,
    alto: false,
    tenor: false,
    bass: false,
  });

  const [channelSolos, setChannelSolos] = useState({
    soprano: false,
    alto: false,
    tenor: false,
    bass: false,
  });

  // Keep tempo in sync when score changes
  useEffect(() => {
    setTempo(score.metadata.tempoBpm || 84);
  }, [score.metadata.tempoBpm]);

  // Connect audio callbacks for playhead sync
  useEffect(() => {
    audioPlayer.setCallbacks(
      (mNum) => {
        onMeasureChange(mNum);
      },
      () => {
        if (isLooping) {
          audioPlayer.seekToMeasure(1, score);
          audioPlayer.play(score);
        } else {
          setIsPlaying(false);
        }
      }
    );
  }, [score, isLooping, onMeasureChange]);

  const handlePlayToggle = async () => {
    if (isPlaying) {
      audioPlayer.pause();
      setIsPlaying(false);
    } else {
      await audioPlayer.play(score);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    audioPlayer.stop();
    setIsPlaying(false);
    onMeasureChange(1);
  };

  const handleRewind = () => {
    audioPlayer.seekToMeasure(1, score);
    onMeasureChange(1);
  };

  const handleInstrumentChange = (inst: InstrumentType) => {
    setInstrument(inst);
    audioPlayer.setInstrument(inst);
  };

  const handleMasterVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    audioPlayer.setMasterVolume(vol);
  };

  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    audioPlayer.setTempo(newTempo);
    if (onScoreUpdate) {
      onScoreUpdate({
        ...score,
        metadata: {
          ...score.metadata,
          tempoBpm: newTempo,
        }
      });
    }
  };

  const handleChannelVolChange = (voice: VoicePart, vol: number) => {
    const updated = { ...channelVolumes, [voice]: vol };
    setChannelVolumes(updated);
    audioPlayer.voiceControls[voice] = vol;
    audioPlayer.updateGains();
  };

  const handleToggleMute = (voice: VoicePart) => {
    const key = `${voice}Mute` as keyof typeof audioPlayer.voiceControls;
    const current = !channelMutes[voice];
    const updated = { ...channelMutes, [voice]: current };
    setChannelMutes(updated);
    (audioPlayer.voiceControls as any)[key] = current;
    audioPlayer.updateGains();
  };

  const handleToggleSolo = (voice: VoicePart) => {
    const key = `${voice}Solo` as keyof typeof audioPlayer.voiceControls;
    const current = !channelSolos[voice];
    const updated = { ...channelSolos, [voice]: current };
    setChannelSolos(updated);
    (audioPlayer.voiceControls as any)[key] = current;
    audioPlayer.updateGains();
  };

  // Quick preset: Solo SA (women) or Solo TB (men)
  const handleQuickDuo = (preset: 'all' | 'SA' | 'TB') => {
    if (preset === 'all') {
      const reset = { soprano: false, alto: false, tenor: false, bass: false };
      setChannelSolos(reset);
      audioPlayer.voiceControls.sopranoSolo = false;
      audioPlayer.voiceControls.altoSolo = false;
      audioPlayer.voiceControls.tenorSolo = false;
      audioPlayer.voiceControls.bassSolo = false;
    } else if (preset === 'SA') {
      const sa = { soprano: true, alto: true, tenor: false, bass: false };
      setChannelSolos(sa);
      audioPlayer.voiceControls.sopranoSolo = true;
      audioPlayer.voiceControls.altoSolo = true;
      audioPlayer.voiceControls.tenorSolo = false;
      audioPlayer.voiceControls.bassSolo = false;
    } else if (preset === 'TB') {
      const tb = { soprano: false, alto: false, tenor: true, bass: true };
      setChannelSolos(tb);
      audioPlayer.voiceControls.sopranoSolo = false;
      audioPlayer.voiceControls.altoSolo = false;
      audioPlayer.voiceControls.tenorSolo = true;
      audioPlayer.voiceControls.bassSolo = true;
    }
    audioPlayer.updateGains();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white shadow-2xl transition-all">
      {/* Expandable SATB 4-Channel Mixer */}
      {showMixer && (
        <div className="bg-slate-950/95 border-b border-slate-800 p-4 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
          {(['soprano', 'alto', 'tenor', 'bass'] as VoicePart[]).map(voice => {
            const label = voice === 'soprano' ? 'Sopran' : (voice === 'alto' ? 'Alto' : (voice === 'tenor' ? 'Tenor' : 'Bass'));
            const isMuted = channelMutes[voice];
            const isSolo = channelSolos[voice];
            const vol = channelVolumes[voice];

            return (
              <div key={`mixer_${voice}`} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-200">{label}</span>
                  <div className="flex space-x-1.5">
                    <button
                      onClick={() => handleToggleMute(voice)}
                      className={`px-2 py-0.5 text-xs font-bold rounded ${
                        isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Mute
                    </button>
                    <button
                      onClick={() => handleToggleSolo(voice)}
                      className={`px-2 py-0.5 text-xs font-bold rounded ${
                        isSolo ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Solo
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 w-6 font-mono">{Math.round(vol * 100)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={vol}
                    onChange={(e) => handleChannelVolChange(voice, parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            );
          })}

          {/* Quick presets footer in mixer */}
          <div className="md:col-span-4 flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
            <span className="text-slate-400">Pilihan Cepat Latihan Suara:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleQuickDuo('all')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
              >
                Semua Suara (SATB)
              </button>
              <button
                onClick={() => handleQuickDuo('SA')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
              >
                Wanita Saja (S + A)
              </button>
              <button
                onClick={() => handleQuickDuo('TB')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
              >
                Pria Saja (T + B)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Control Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRewind}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Kembali ke Awal"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={handlePlayToggle}
            className="w-11 h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/30 transition-transform active:scale-95"
            title={isPlaying ? 'Jeda (Pause)' : 'Putar Audio (Play)'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
          </button>

          <button
            onClick={handleStop}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Berhenti (Stop)"
          >
            <Square className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-lg transition-colors ${
              isLooping ? 'text-blue-400 bg-blue-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Ulangi Lagu (Loop)"
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Current Measure Badge */}
          <div className="ml-2 px-2.5 py-1 bg-slate-800 rounded-md text-xs font-mono text-blue-300 border border-slate-700">
            Birama: <span className="font-bold text-white">{currentMeasure}</span> / {score.measures.length}
          </div>
        </div>

        {/* Center: Instrument Presets */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => handleInstrumentChange('organ')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              instrument === 'organ' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Organ Pipa Gereja
          </button>
          <button
            onClick={() => handleInstrumentChange('choir')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              instrument === 'choir' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Paduan Suara (Choir)
          </button>
          <button
            onClick={() => handleInstrumentChange('piano')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              instrument === 'piano' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Piano Akustik
          </button>
        </div>

        {/* Right: Tempo & Volume & Mixer Toggle */}
        <div className="flex items-center space-x-4">
          {/* Tempo Controls */}
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-xs text-slate-400">Tempo:</span>
            <input
              type="range"
              min="50"
              max="160"
              value={tempo}
              onChange={(e) => handleTempoChange(parseInt(e.target.value, 10))}
              className="w-20 accent-blue-500 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-300 w-12">{tempo} BPM</span>
          </div>

          {/* Master Volume */}
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
              className="w-16 accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Mixer Accordion Toggle Button */}
          <button
            onClick={() => setShowMixer(!showMixer)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              showMixer ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Mixer SATB</span>
            {showMixer ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
