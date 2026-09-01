import { useEffect, useMemo, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import "./App.css"

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=54.1167&longitude=-0.1333&current=temperature_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FLondon&forecast_days=1"

const COMMANDS = [
  {
    command: "/amazon",
    name: "Amazon",
    type: "redirect",
    color: "amazon",
    description: "Search Amazon UK",
  },
  {
    command: "/youtube",
    name: "YouTube",
    type: "redirect",
    color: "youtube",
    description: "Search YouTube",
  },
  {
    command: "/jw",
    name: "JW.org",
    type: "redirect",
    color: "jw",
    description: "Search JW.org",
  },
  {
    command: "/wol",
    name: "Watchtower Online Library",
    type: "redirect",
    color: "wol",
    description: "Search Watchtower Online Library",
  },
  {
    command: "/maps",
    name: "Google Maps",
    type: "redirect",
    color: "maps",
    description: "Search Google Maps",
  },
  {
    command: "/reddit",
    name: "Reddit",
    type: "redirect",
    color: "reddit",
    description: "Search Reddit",
  },
  {
    command: "/github",
    name: "GitHub",
    type: "redirect",
    color: "github",
    description: "Search GitHub",
  },
  {
    command: "/ebay",
    name: "eBay",
    type: "redirect",
    color: "ebay",
    description: "Search eBay UK",
  },
  {
    command: "/wikipedia",
    name: "Wikipedia",
    type: "redirect",
    color: "wikipedia",
    description: "Search Wikipedia",
  },
  {
    command: "/flow",
    name: "Flow",
    type: "flow",
    color: "flow",
    description: "AI-powered search",
  },
  {
    command: "/calc",
    name: "Calculator",
    type: "calc",
    color: "calc",
    description: "Calculate an expression",
  },
  {
    command: "/weather",
    name: "Weather",
    type: "weather",
    color: "weather",
    description: "Check the weather",
  },
]

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return "Good morning"
  if (hour >= 12 && hour < 17) return "Good afternoon"
  if (hour >= 17 && hour < 21) return "Good evening"

  return "Good night"
}

function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Foggy",
    48: "Foggy",
    51: "Drizzle",
    53: "Drizzle",
    55: "Drizzle",
    61: "Rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Showers",
    81: "Showers",
    82: "Heavy showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Thunderstorm",
  }

  return descriptions[code] || "Unknown"
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️"
  if (code === 1) return "🌤️"
  if (code === 2) return "⛅"
  if (code === 3) return "☁️"
  if (code === 45 || code === 48) return "🌫️"

  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return "🌧️"
  }

  if ([71, 73, 75].includes(code)) {
    return "🌨️"
  }

  if ([95, 96, 99].includes(code)) {
    return "⛈️"
  }

  return "🌡️"
}

function getSearchMode(value) {
  const lowerValue = value.toLowerCase()

  return (
    COMMANDS.find((item) =>
      lowerValue.startsWith(`${item.command} `)
    ) || null
  )
}

function calculateExpression(expression) {
  const cleaned = expression
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/,/g, "")
    .trim()

  if (!cleaned) return null

  if (!/^[0-9+\-*/().%\s]+$/.test(cleaned)) {
    return null
  }

  try {
    const result = Function(
      `"use strict"; return (${cleaned})`
    )()

    if (!Number.isFinite(result)) {
      return null
    }

    return result
  } catch {
    return null
  }
}

function App() {
  const [time, setTime] = useState(new Date())
  const [search, setSearch] = useState("")
  const [weather, setWeather] = useState(null)
  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const [highlightedCommand, setHighlightedCommand] = useState(0)
  const [calculation, setCalculation] = useState(null)
  const [commandWeather, setCommandWeather] = useState(null)
  const [commandWeatherLoading, setCommandWeatherLoading] =
    useState(false)
  const [flowAnswer, setFlowAnswer] = useState("")
  const [flowLoading, setFlowLoading] = useState(false)
  const [flowError, setFlowError] = useState("")

  const inputRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function loadWeather() {
      try {
        const response = await fetch(WEATHER_URL)
        const data = await response.json()

        setWeather(data)
      } catch (error) {
        console.error("Failed to load weather:", error)
      }
    }

    loadWeather()
  }, [])

  const searchMode = useMemo(
    () => getSearchMode(search),
    [search]
  )

  const commandMatches = useMemo(() => {
    if (!search.startsWith("/")) {
      return []
    }

    const commandText = search
      .slice(1)
      .toLowerCase()
      .split(" ")[0]

    if (!commandText) {
      return []
    }

    return COMMANDS.filter((command) =>
      command.command
        .slice(1)
        .startsWith(commandText)
    )
  }, [search])

  useEffect(() => {
    const commandText = search
      .slice(1)
      .split(" ")[0]

    if (
      search.startsWith("/") &&
      commandText.length >= 1 &&
      !search.includes(" ")
    ) {
      setCommandMenuOpen(true)

      if (
        highlightedCommand >= commandMatches.length
      ) {
        setHighlightedCommand(0)
      }
    } else {
      setCommandMenuOpen(false)
    }
  }, [
    search,
    commandMatches.length,
    highlightedCommand,
  ])

  function selectCommand(command) {
    setSearch(`${command.command} `)

    setCommandMenuOpen(false)
    setHighlightedCommand(0)

    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  function handleKeyDown(event) {
    if (
      !commandMenuOpen ||
      commandMatches.length === 0
    ) {
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()

      setHighlightedCommand(
        (current) =>
          (current + 1) % commandMatches.length
      )
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()

      setHighlightedCommand(
        (current) =>
          (current -
            1 +
            commandMatches.length) %
          commandMatches.length
      )
    }

    if (event.key === "Tab") {
      event.preventDefault()

      selectCommand(
        commandMatches[highlightedCommand]
      )
    }
  }

  async function runWeather(query) {
    const location = query.trim() || "Flamborough"

    setCommandWeatherLoading(true)
    setCommandWeather(null)

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          location
        )}&count=1&language=en&format=json`
      )

      const geoData = await geoResponse.json()

      if (!geoData.results?.length) {
        setCommandWeatherLoading(false)
        return
      }

      const place = geoData.results[0]

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`
      )

      const weatherData =
        await weatherResponse.json()

      setCommandWeather({
        ...weatherData,
        name: place.name,
        country: place.country,
      })
    } catch (error) {
      console.error(
        "Weather command error:",
        error
      )
    } finally {
      setCommandWeatherLoading(false)
    }
  }

  async function runFlow(query) {
    setFlowLoading(true)
    setFlowAnswer("")
    setFlowError("")
    setCalculation(null)
    setCommandWeather(null)

    try {
      const response = await fetch(
        "https://05-flow.noahwilfred2022.workers.dev",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            query,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Flow failed."
        )
      }

      setFlowAnswer(data.answer || "")
    } catch (error) {
      console.error("Flow error:", error)

      setFlowError(
        "Flow couldn't generate an answer right now."
      )
    } finally {
      setFlowLoading(false)
    }
  }

  function runCommand(command, query) {
    if (command.color === "amazon") {
      window.location.href =
        `https://www.amazon.co.uk/s?k=${encodeURIComponent(
          query
        )}`

      return
    }

    if (command.color === "youtube") {
      window.location.href =
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          query
        )}`

      return
    }

    if (command.color === "jw") {
      window.location.href =
        `https://www.jw.org/en/search/?q=${encodeURIComponent(
          query
        )}`

      return
    }

    if (command.color === "wol") {
      window.location.href =
        `https://wol.jw.org/en/wol/s/r1/lp-e?q=${encodeURIComponent(
          query
        )}`

      return
    }

    if (command.color === "maps") {
      window.location.href =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          query
        )}`

      return
    }

    if (command.color === "reddit") {
      window.location.href =
        `https://www.reddit.com/search/?q=${encodeURIComponent(
          query
        )}`

      return
    }

    if (command.color === "github") {
      window.location.href =
        `https://github.com/search?q=${encodeURIComponent(
          query
        )}`

      return
    }

    if (command.color === "ebay") {
      window.location.href =
        `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(
          query
        )}`

      return
    }

    if (command.color === "wikipedia") {
      window.location.href =
        `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(
          query
        )}`

      return
    }

    if (command.color === "flow") {
      runFlow(query)
      return
    }

    if (command.color === "calc") {
      const result =
        calculateExpression(query)

      if (result === null) {
        return
      }

      setCalculation({
        expression: query,
        result,
      })

      setFlowAnswer("")
      setFlowError("")
      setCommandWeather(null)

      return
    }

    if (command.color === "weather") {
      runWeather(query)

      setCalculation(null)
      setFlowAnswer("")
      setFlowError("")
    }
  }

  function handleSearch(event) {
    event.preventDefault()

    const query = search.trim()

    if (!query) {
      return
    }

    const command = getSearchMode(search)

    if (command) {
      const commandQuery = query
        .slice(command.command.length)
        .trim()

      if (!commandQuery) {
        return
      }

      runCommand(command, commandQuery)
      return
    }

    window.location.href =
      `https://www.bing.com/search?q=${encodeURIComponent(
        query
      )}`
  }

  const greeting = getGreeting(
    time.getHours()
  )

  const currentTime =
    time.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })

  const currentDate =
    time.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })

  return (
    <div className="app">
      <main className="home">
        <header className="top">
          <div className="date">
            {currentDate}
          </div>

          <div className="time">
            {currentTime}
          </div>
        </header>

        <section className="main">
          <h1>
            {greeting} Noah.
          </h1>

          <div className="search-wrapper">
            {commandMenuOpen &&
              commandMatches.length > 0 && (
                <div className="command-menu">
                  {commandMatches.map(
                    (command, index) => (
                      <button
                        key={command.command}
                        type="button"
                        className={`command-item ${
                          index ===
                          highlightedCommand
                            ? "highlighted"
                            : ""
                        }`}
                        onMouseEnter={() =>
                          setHighlightedCommand(
                            index
                          )
                        }
                        onClick={() =>
                          selectCommand(
                            command
                          )
                        }
                      >
                        <span
                          className={`command-dot ${command.color}`}
                        />

                        <span className="command-name">
                          {command.command}
                        </span>

                        <span className="command-description">
                          {command.description}
                        </span>

                        {index ===
                          highlightedCommand && (
                          <span className="command-tab">
                            Tab
                          </span>
                        )}
                      </button>
                    )
                  )}
                </div>
              )}

            <form
              className={`search ${
                searchMode?.color || ""
              }`}
              onSubmit={handleSearch}
            >
              <svg
                className="search-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />

                <path
                  d="M16.5 16.5L21 21"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

              <input
                ref={inputRef}
                value={search}
                onChange={(event) => {
                  const value =
                    event.target.value

                  setSearch(value)

                  if (
                    value.startsWith("/") &&
                    !value.includes(" ")
                  ) {
                    setHighlightedCommand(0)
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search"
                autoComplete="off"
                spellCheck="false"
                autoFocus
              />

              {searchMode && (
                <span className="search-mode">
                  {searchMode.name}
                </span>
              )}
            </form>
          </div>

          <div className="result-area">
            {(flowLoading ||
              flowAnswer ||
              flowError) && (
              <div className="flow-result">
                <div className="flow-header">
                  <div className="flow-status">
                    <span className="flow-orb" />

                    <span>
                      Flow
                    </span>
                  </div>

                  {flowLoading && (
                    <span className="flow-thinking">
                      Thinking
                    </span>
                  )}
                </div>

                {flowLoading && (
                  <div className="flow-loading">
                    <span />
                    <span />
                    <span />
                  </div>
                )}

                {flowAnswer && (
                  <div className="flow-answer">
                    <ReactMarkdown
                      remarkPlugins={[
                        remarkGfm,
                        remarkMath,
                      ]}
                      rehypePlugins={[
                        rehypeKatex,
                      ]}
                    >
                      {flowAnswer}
                    </ReactMarkdown>
                  </div>
                )}

                {flowError && (
                  <div className="flow-error">
                    {flowError}
                  </div>
                )}
              </div>
            )}

            {calculation !== null && (
              <div className="result">
                <span className="result-label">
                  {calculation.expression}
                </span>

                <span className="calculation-result">
                  {calculation.result}
                </span>
              </div>
            )}

            {commandWeatherLoading && (
              <div className="result">
                <span className="result-label">
                  Loading weather...
                </span>
              </div>
            )}

            {commandWeather &&
              !commandWeatherLoading && (
                <div className="result weather-command-result">
                  <div>
                    <span className="result-label">
                      {commandWeather.name}
                    </span>

                    <div className="weather-command-main">
                      <span className="weather-icon">
                        {getWeatherIcon(
                          commandWeather.current
                            .weather_code
                        )}
                      </span>

                      <span className="temperature">
                        {Math.round(
                          commandWeather.current
                            .temperature_2m
                        )}
                        °
                      </span>

                      <span className="condition">
                        {getWeatherDescription(
                          commandWeather.current
                            .weather_code
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="weather-command-details">
                    H{" "}
                    {Math.round(
                      commandWeather.daily
                        .temperature_2m_max[0]
                    )}
                    °

                    <span>
                      •
                    </span>

                    L{" "}
                    {Math.round(
                      commandWeather.daily
                        .temperature_2m_min[0]
                    )}
                    °
                  </div>
                </div>
              )}
          </div>

          {weather && (
            <div className="weather">
              <div className="weather-location">
                Flamborough
              </div>

              <div className="weather-main">
                <span className="weather-icon">
                  {getWeatherIcon(
                    weather.current
                      .weather_code
                  )}
                </span>

                <span className="temperature">
                  {Math.round(
                    weather.current
                      .temperature_2m
                  )}
                  °
                </span>

                <span className="condition">
                  {getWeatherDescription(
                    weather.current
                      .weather_code
                  )}
                </span>
              </div>

              <div className="weather-details">
                <span>
                  H{" "}
                  {Math.round(
                    weather.daily
                      .temperature_2m_max[0]
                  )}
                  °
                </span>

                <span>
                  L{" "}
                  {Math.round(
                    weather.daily
                      .temperature_2m_min[0]
                  )}
                  °
                </span>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
