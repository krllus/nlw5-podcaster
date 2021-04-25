import React, { useContext, useEffect, useRef, useState } from 'react';
import { PlayerContext, usePlayer } from '../../context/PlayerContext';
import Image from "next/image"
import Slider from "rc-slider"

import styles from './styles.module.scss';
import "rc-slider/assets/index.css"
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';


export function Player() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0)

    const { episodeList,
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        isShuffling,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        clearPlayerState } = usePlayer();

    const episode = episodeList[currentEpisodeIndex]

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }

        if (isPlaying) {
            audioRef.current.play()
        } else {
            audioRef.current.pause()
        }
    }, [isPlaying])

    function setupProgressListener() {
        audioRef.current.currentTime = 0;
        audioRef.current.addEventListener('timeupdate', (event) => {
            setProgress(Math.floor(audioRef.current.currentTime))
        })
    }

    function handleOnEpisodeFinished() {
        if (hasNext) {
            playNext()
        } else {
            clearPlayerState()
        }
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount)
    }

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora" />
                <strong>Tocando Agora {episode?.title}</strong>
            </header>

            {episode ? (
                <div className={styles.currentEpisode}>
                    <Image width={592} height={592} src={episode.thumbnail} objectFit="cover" />
                    <strong>{episode.members}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione Um PodCast para Ouvir</strong>
                </div>
            )}

            {episode && (
                <audio
                    src={episode.url}
                    autoPlay
                    ref={audioRef}
                    loop={isLooping}
                    onEnded={handleOnEpisodeFinished}
                    onLoadedMetadata={setupProgressListener}
                    onPlay={() => setPlayingState(true)}
                    onPause={() => setPlayingState(false)}
                />
            )}

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>

                    {episode ? (
                        <Slider
                            max={episode.duration}
                            value={progress}
                            onChange={handleSeek}
                            trackStyle={{ backgroundColor: '#04d361' }}
                            railStyle={{ backgroundColor: '#9f75ff' }}
                            handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
                        />
                    ) : (
                        <div className={styles.slider}>
                            <div className={styles.emptySlider} />
                        </div>
                    )}

                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                <div className={styles.buttons}>
                    <button type="button" disabled={!episode || episodeList.length == 1} onClick={toggleShuffle} className={isShuffling ? styles.isActive : ''}>
                        <img src="/shuffle.svg" alt="Embaralhar"></img>
                    </button>

                    <button type="button" disabled={!episode || !hasPrevious} onClick={playPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior"></img>
                    </button>

                    <button type="button" className={styles.playButton} disabled={!episode} onClick={togglePlay}>
                        {isPlaying ? <img src="/pause.svg" alt="Pausar" /> : <img src="/play.svg" alt="Tocar" />}
                    </button>

                    <button type="button" disabled={!episode || !hasNext} onClick={playNext}>
                        <img src="/play-next.svg" alt="Tocar Proxima"></img>
                    </button>

                    <button type="button"
                        disabled={!episode}
                        onClick={toggleLoop}
                        className={isLooping ? styles.isActive : ''}>
                        <img src="/repeat.svg" alt="Repetir"></img>
                    </button>

                </div>
            </footer>
        </div>
    );
}

