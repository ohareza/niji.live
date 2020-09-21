"use strict";

const channels = [
  "UCHjeZylSgXDSnor8wUnwU_g",
  "UCjFu-9GHnabzSFRAYm1B9Dw",
  "UCbLgcjfsUaCUgJh9SVit8kw",
  "UCpJtk0myFr5WnyfsmnInP-w",
  "UCA3WE2WRSpoIvtnoVGq4VAw",
  "UCZ5dNZsqBjBzbBl0l_IdmXg",
  "UCrR7JxkbeLY82e8gsj_I0pQ",
  "UCOmjciHZ8Au3iKMElKXCF_g",
  "UCkL9OLKjIQbKk2CztbpOCFg",
  "UC8Snw5i4eOJXEQqURAK17hQ",
  "UCoWH3sDpeXG1aXmOxveX4KA",
  "UCyRkQSuhJILuGOuXk10voPg",
  "UCk5r533QVMgJUdWwqegH2TA"
];
  
const api =
  "https://api.chooks.app/videos?status=live,upcoming&group=nijisanji";

function yt(id) {
  return Response.redirect("https://youtube.com/watch?v=" + id, 307);
}

async function handleRequest() {
  const request = await fetch(api, { cf: { cacheTtl: 60 }}) 
  const videos = await request.json();

  let min_start_time = Infinity;
  let min_scheduled_time = Infinity;
  let live_id, scheduled_id;

  videos.forEach( video => {
    if (!channels.includes(video.channel)) return;

    if (video.status == 'live' && video.start_time < min_start_time) {
      min_start_time = video.start_time;
      live_id = video.id;
    }

    if (live_id || video.status == 'upcoming' && video.scheduled_time < min_scheduled_time) {
      min_scheduled_time = video.scheduled_time;
      scheduled_id = video.id;
    }
  })

  if (live_id) return yt(live_id);
  if (scheduled_id) return yt(scheduled_id);
  return new Response("Nothing scheduled currently");
}

addEventListener("fetch", event => {
  return event.respondWith(handleRequest());
});
