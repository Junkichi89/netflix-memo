import React, { useState, useEffect } from "react"
import YouTube from "react-youtube"
import axios from "./../axios"
import "./Row.scss"
const movieTrailer = require('movie-trailer')


const base_url = "https://image.tmdb.org/t/p/original"

type Props = {
  title: string
  fetchUrl: string
  isLargeRow?: boolean
}

type Movie = {
  id: string
  name: string
  title: string
  original_name: string
  poster_path: string
  backdrop_path: string
}

//trailerのoption
type Options = {
  height: string
  width: string
  playerVars: {
    autoplay: 0 | 1 | undefined
  }
}

export const Row = ({ title, fetchUrl, isLargeRow }: Props) => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [trailerUrl, setTrailerUrl] = useState<string | null>("")

  //urlが更新される度に
  useEffect(() => {
    async function fetchData() {
      const request: any = await axios.get(fetchUrl)
      setMovies(request.data.results)
      return request
    }
    fetchData()
  }, [fetchUrl])

  const opts: Options = {
    height: "390",
    width: "640",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  }

  const API_KEY = process.env.REACT_APP_APP_MOVIE_API;

  const handleClick = async (movie: Movie) => {
    if (trailerUrl) {
      setTrailerUrl("")
    } else {
      let trailerurl: any = await axios.get(`/movie/${movie.id}/videos?api_key=${API_KEY}`)
      setTrailerUrl(trailerurl.data.results[0]?.key)
    }
    movieTrailer(movie?.name || movie?.title || movie?.original_name || "")
      .then((url: string) => {
        const urlParams = new URLSearchParams(new URL(url).search)
        setTrailerUrl(urlParams.get("v"))
      })
      .catch((error: any) => console.log(error.message))
  }

  return (
    <div className="Row">
      <h2 className={`title-black ${isLargeRow && "title-white"}`}>{title}</h2>
      <div className="Row-posters">
        {/* ポスターコンテンツ */}
        {movies.map((movie, i) => (
          <img
            key={movie.id}
            className={`Row-poster ${isLargeRow && "Row-poster-large"}`}
            src={`${base_url}${isLargeRow ? movie.poster_path : movie.backdrop_path
              }`}
            alt={movie.name}
            onClick={() => handleClick(movie)}
          />
        ))}
      </div>
      {trailerUrl && <YouTube videoId={trailerUrl} opts={opts} />}
    </div>
  )
}