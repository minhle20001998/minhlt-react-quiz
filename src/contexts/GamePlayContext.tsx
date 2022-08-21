/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { fetchStarship } from '../apis/starshipsApi';
import { createArrayFromRange } from '../utils/Array';
import StarshipType from './Starship.type';

interface PropsType {
  children: JSX.Element
}

interface ContextType {
  allStarships: StarshipType[],
  currentStarship: number | null,
  opponentStarship: number | null,
  userScore: number,
  opponentScore: number,
  winner: string | null,
  category: string,
  isRoundEnded: boolean | null,
  isGameEnded: boolean | null,
  revealStarship: (_: boolean) => void,
  setIsRoundEnded: (_: boolean | null) => void,
  restartGame: () => void,
  setCategory: (_: string) => void
}

const defaultValue: ContextType = {
  allStarships: [],
  currentStarship: null,
  opponentStarship: null,
  userScore: 0,
  opponentScore: 0,
  winner: null,
  category: "",
  isRoundEnded: null,
  isGameEnded: null,
  revealStarship: (_: boolean) => { },
  setIsRoundEnded: (_: boolean | null) => { },
  restartGame: () => { },
  setCategory: (_: string) => { }
}

const GamePlayContext = createContext<ContextType>(defaultValue);

enum WINNER {
  USER = "You win !",
  COM = "You lose !",
  DRAW = "Draw !"
}

export default function GamePlayProvider(props: PropsType) {
  const [allStarships, setAllStarships] = useState<StarshipType[]>([]);
  const [currentStarship, setCurrentStarship] = useState<number | null>(null);
  const [opponentStarship, setOpponentStarship] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("");
  const [unusedStarship, setUnusedStarship] = useState<number[]>([]);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isRoundEnded, setIsRoundEnded] = useState<boolean | null>(null);
  const [isGameEnded, setIsGameEnded] = useState<boolean | null>(null);
  const [numberOfRounds, setNumberOfRounds] = useState(0);
  const firstTimeFetch = useRef<boolean>(false);
  const firstTimeReveal = useRef<boolean>(false);
  const NUMBER_OF_ROUNDS = 10;

  /**
   * fetch data one time only on the first render
   */
  useEffect(() => {
    if (!firstTimeFetch.current)
      getAllStarships();
    firstTimeFetch.current = true
  }, [])

  /**
   * randomize player starship on the first render
   */
  useEffect(() => {
    if (!firstTimeReveal.current) {
      revealStarship(true);
    }
    if (allStarships.length !== 0)
      firstTimeReveal.current = true
  }, [allStarships.length])

  /**
   * handle events after user choose a field
   *    - calculate score
   *    - end the round
   */
  useEffect(() => {
    if (category !== "") {
      calculateScore(compareTwoStarship(category));
      setIsRoundEnded(true);
    }
  }, [category])

  /**
   * if the round ends
   *    - increase number of rounds
   * if the round ends and user is the winner
   *    - get user new starship
   */
  useEffect(() => {
    if (isRoundEnded === false) {
      setNumberOfRounds(prev => prev + 1);
      resetRound();
    }
    if (winner === WINNER.USER) {
      revealStarship(true);
    }
  }, [isRoundEnded])

  /**
   * if number of rounds reaches maximum
   *    - end the game
   *    - calculate final score
   */
  useEffect(() => {
    if (numberOfRounds === NUMBER_OF_ROUNDS) {
      setIsGameEnded(true);
      calculateScore(userScore - opponentScore)
    }
  }, [numberOfRounds])

  /**
   * if the game ends
   *    - hide all starships
   * if the game restarts
   *    - get user new starship
   */
  useEffect(() => {
    if (isGameEnded) {
      setCurrentStarship(null);
      setOpponentStarship(null);
    }
    if (isGameEnded === false) {
      revealStarship(true);
    }
  }, [isGameEnded])

  // handle reset the round
  const resetRound = () => {
    setCategory("");
    setWinner("");
    setOpponentStarship(null);
  }

  // handle restart the game
  const restartGame = () => {
    setOpponentStarship(null);
    setCategory("");
    setUnusedStarship(createArrayFromRange(0, allStarships.length - 1));
    setUserScore(0);
    setOpponentScore(0);
    setIsGameEnded(false);
    setIsRoundEnded(false);
    setNumberOfRounds(1);
    setWinner(null)
  }

  /**
   * get starships by fetching from api
   * 
   * if data has a next url for more data
   * -> fetch more data in the background and add it to the state without interupting the gameplay
   */
  const getAllStarships = async (nextProps: string = "") => {
    const { results: starships, next } = await fetchStarship(nextProps);
    setUnusedStarship(prev => [...prev, ...createArrayFromRange(prev.length + 1, starships.length + prev.length)])
    setAllStarships(prev => [...prev, ...starships]);
    if (next) {
      getAllStarships(next)
    }
  }

  /**
   * get a random starship without drawing the same one
   */
  const getRandomStarship = (array: number[]) => {
    const randomElement = array[Math.floor(Math.random() * array.length)];
    setUnusedStarship((prev) => prev.filter((item) => item !== randomElement))
    return randomElement
  }

  /**
   * draw a random starship
   * if isUser true 
   *  set starship's index for user state
   * else 
   *  set starship's index for opponent state
   */
  const revealStarship = (isUser: boolean) => {
    if (isRoundEnded || isGameEnded) {
      return;
    }
    const index = getRandomStarship(unusedStarship)
    if (isUser) {
      setCurrentStarship(index)
    } else {
      setOpponentStarship(index)
    }
  }

  /**
   * compare two starships base on chosen category
   * @return 
   *  -1: if user < opponent
   *  0: if user == opponent
   *  1: if user > opponent
   */
  const compareTwoStarship = (category: string) => {
    if (currentStarship === null || opponentStarship === null) {
      return null;
    }
    if (!allStarships[currentStarship] || !allStarships[opponentStarship]) {
      return null;
    }

    let userVariable = Array.isArray(allStarships[currentStarship]?.[category])
      ? allStarships[currentStarship]?.[category].length
      : parseInt(allStarships[currentStarship]?.[category].replace(/^\D+/g, ''))

    let computerVariable = Array.isArray(allStarships[currentStarship]?.[category])
      ? allStarships[opponentStarship]?.[category].length
      : parseInt(allStarships[opponentStarship]?.[category].replace(/^\D+/g, ''))

    userVariable = isNaN(userVariable) ? 0 : userVariable
    computerVariable = isNaN(computerVariable) ? 0 : computerVariable

    if (userVariable > computerVariable) {
      return 1
    } else if (userVariable < computerVariable) {
      return -1;
    } else {
      return 0;
    }
  }

  /**
   * calculate score and set winner title
   * if user win -> increase user score
   * if computer win -> increase computer score
   * if it is a draw -> do nothing
   */
  const calculateScore = (score: number | null) => {
    if (!score) {
      setWinner(WINNER.DRAW)
      return;
    }
    if (score > 0) {
      setUserScore((prev) => prev + 1)
      setWinner(WINNER.USER)
    } else if (score < 0) {
      setOpponentScore((prev) => prev + 1)
      setWinner(WINNER.COM)
    } else {
      setWinner(WINNER.DRAW)
    }
  }

  return (
    <GamePlayContext.Provider value={{
      allStarships,
      currentStarship,
      opponentStarship,
      userScore,
      opponentScore,
      winner,
      category,
      isRoundEnded,
      isGameEnded,
      setCategory,
      revealStarship,
      setIsRoundEnded,
      restartGame
    }}>
      {props.children}
    </GamePlayContext.Provider>
  )
}


export const useGamePlay = () => {
  return useContext(GamePlayContext);
}
