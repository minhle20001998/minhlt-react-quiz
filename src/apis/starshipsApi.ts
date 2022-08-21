import axios from "axios"

export const fetchStarship = async (next?: string) => {
  const api = next || `https://swapi.dev/api/starships/`
  const { data } = await axios.get(api)
  return data
}