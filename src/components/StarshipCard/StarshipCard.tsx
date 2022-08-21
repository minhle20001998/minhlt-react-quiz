import React from 'react'
import style from './StarshipCard.module.css'
import srcImg from '../../assets/starwars.png'
import { useGamePlay } from '../../contexts/GamePlayContext'
import StarshipType from '../../contexts/Starship.type'

interface PropsType {
  isUser?: boolean,
  data: StarshipType | null
}

export default function StarshipCard(props: PropsType) {

  const { revealStarship, setCategory, category } = useGamePlay();

  const listItem = [
    { title: "Max Speed", mapping: 'max_atmosphering_speed' },
    { title: "Credit Cost", mapping: 'cost_in_credits' },
    { title: "Passengers", mapping: 'passengers' },
    { title: "Film Appearances", mapping: 'films', length: true },
  ]

  // handle user click
  //  if this card is user's card:
  //    - set chosen category for further comparison
  //    - draw a random starship for opponent
  const handleClick = (mapping: string) => () => {
    if (!props.isUser) {
      return;
    }
    setCategory(mapping)
    revealStarship(false);
  }

  return (
    <div className={style.card}>
      <div className={style.header}>
        {props.data?.name || '???'}
      </div>
      <div className={style.cover}>
        <img src={srcImg} alt="starwars" />
      </div>
      <div className={style.body}>
        {listItem.map((item: any) => {
          return <div
            className={category === item.mapping ? style.active : ''}
            key={item.title}
            onClick={handleClick(item.mapping)}
          >
            <span>{item.title}:</span>
            <span>{item.length
              ? props.data?.[item.mapping].length ?? '???'
              : props.data?.[item.mapping] ?? '???'}
            </span>
          </div>
        })}
      </div>
    </div>
  )
}
