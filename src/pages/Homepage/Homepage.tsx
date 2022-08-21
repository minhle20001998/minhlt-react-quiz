import React from 'react'
import StarshipCard from '../../components/StarshipCard/StarshipCard';
import { useGamePlay } from '../../contexts/GamePlayContext'
import styles from './Homepage.module.css'
export default function Homepage() {
  const {
    userScore,
    opponentScore,
    currentStarship,
    opponentStarship,
    allStarships,
    setIsRoundEnded,
    winner,
    isRoundEnded,
    isGameEnded,
    restartGame
  } = useGamePlay();

  // proceed next round
  const nextRound = () => {
    setIsRoundEnded(false)
    if (isGameEnded) {
      restartGame();
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.stars}></div>
      <div className={styles.twinkling}></div>
      <div className={styles.content}>
        <div className={styles["score-bar"]}>
          <span>{userScore}</span>
          <span>{opponentScore}</span>
        </div>
        <div className={styles.cards}>
          <StarshipCard
            isUser={true}
            data={currentStarship ? allStarships[currentStarship] : null}
          />
          <div className={`${styles.message} ${(isRoundEnded || isGameEnded)
            ? styles.active
            : styles.inactive}`}
          >
            {(isRoundEnded || isGameEnded) &&
              <>
                <p>{winner}</p>
                <button className={styles.button} onClick={nextRound}>
                  {isGameEnded ? 'Restart' : 'Next'}
                </button>
              </>
            }
          </div>
          <StarshipCard
            data={opponentStarship ? allStarships[opponentStarship] : null}
          />
        </div>
      </div>
    </div>
  )
}
