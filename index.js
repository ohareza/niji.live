const livers = {
  "UCbLgcjfsUaCUgJh9SVit8kw": ["staff"],
  // 3set
  "UCA3WE2WRSpoIvtnoVGq4VAw": ["zea", "mothercorn", "lia"],
  "UCZ5dNZsqBjBzbBl0l_IdmXg": ["taka", "tamka", "tk"],
  "UCpJtk0myFr5WnyfsmnInP-w": ["hana", "hamna", "hanamaki", "hanmak"],
  // clover
  "UCOmjciHZ8Au3iKMElKXCF_g": ["miyu", "lider"],
  "UCkL9OLKjIQbKk2CztbpOCFg": ["riksa", "jukut"],
  "UC8Snw5i4eOJXEQqURAK17hQ": ["rai"],
  "UCrR7JxkbeLY82e8gsj_I0pQ": ["cia", "amicia", "amicin", "amichon", "amemechon"],
  // lan
  "UCoWH3sDpeXG1aXmOxveX4KA": ["nara", "maung", "mamaung"],
  "UCyRkQSuhJILuGOuXk10voPg": ["layla", "lele"],
  "UCk5r533QVMgJUdWwqegH2TA": ["azura", "zura", "jura", "azuwin"],
  // lupa
  "UCjFu-9GHnabzSFRAYm1B9Dw": ["etna"],
  "UCHjeZylSgXDSnor8wUnwU_g": ["bobon", "bonni", "bonnivier"],
  "UC5qSx7KzdRwbsO1QmJc4d-w": ["siska", "siskuy"],
  // 53renade
  "UCijNnZ-6m8g85UGaRAWuw7g": ["nagisa"],
  "UCMzVa7B8UEdrvUGsPmSgyjA": ["derem"],
  "UC5yckZliCkuaEFbqzLBD7hQ": ["reza", "ejak"]
}

const liverMap = {}

const errorPage = "https://gist.github.com/ohareza/502eff996358202095fafcd529328326#file-niji-live-md"
const iha = "https://api.ihateani.me/v2/graphql"

async function handleRequest(request) {
  if (Object.keys(liverMap).length === 0) {
    // Lazily initialize livermap
    for (const [id, nicks] of Object.entries(livers)) {
      nicks.forEach((nick) => { liverMap[nick] = id })
    }
  }

  const url = new URL(request.url)

  const ident = url.hostname.split(".").slice(0, -2).join(".") || url.pathname.substring(1)

  if (!/[^a-zA-Z]/.test(ident)) {
    console.log(ident)
    if (ident.toLowerCase() in liverMap) {
      return Response.redirect("https://www.youtube.com/channel/" + liverMap[ident] + "/live", 301)
    } else {
      return Response.redirect(errorPage, 302)
    }
  }

  const channelIds = []

  ident.split(/[^a-zA-Z0-9]/).forEach(nick => {
    if (nick.toLowerCase() in liverMap) {
      channelIds.push(liverMap[nick])
    }
  })

  const queryFetch = await fetch("https://api.ihateani.me/v2/graphql", {
    body: JSON.stringify({
      query: `query VTuberLives($ids: [ID]) {vtuber {
        live(channel_id: $ids) {items {id, channel_id}},
        upcoming(channel_id: $ids) {items {id, channel_id, timeData{scheduledStartTime}}}
      }}`,
      variables: {
        ids: channelIds
      }
    }),
    headers: {
      "accept": "application/json",
      "content-type": "application/json"
    },
    method: "POST",
    cf: {
      cacheEverything: true,
      cacheTtl: 60
    }
  })

  const queryJSON = await queryFetch.json()

  const queryRes = queryJSON.data.vtuber

  const videoIds = []

  channelIds.forEach(id => {
    // Put currently ongoing stream to videoIds
    // If it doesn't exist, put soonest scheduled stream
    let found = false
    queryRes.live.items.forEach(live => {
      if (live.channel_id == id) {
        found = true
        videoIds.push(live.id)
        return
      }
    })
    if (found) {
      return
    }
    minTime = Infinity
    minId = ""
    queryRes.upcoming.items.forEach(live => {
      if (live.channel_id == id && live.timeData.scheduledStartTime < minTime) {
        minTime = live.timeData.scheduledStartTime
        minId = live.id
      }
    })
    if (minId) {
      videoIds.push(minId)
    }
  })

  if (videoIds.length > 0) {
    theaterUrl = "https://twitchtheater.tv"
    videoIds.forEach(id => {
      theaterUrl += "/v=" + id
    })

    return Response.redirect(theaterUrl, 302)
  }

  return Response.redirect(errorPage, 302)
}

addEventListener("fetch", async event => {
  return event.respondWith(handleRequest(event.request))
})