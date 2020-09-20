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
    const request = await fetch(api) 
    const videos = await request.json();
  
    const id_only = videos.filter(video => channels.includes(video.channel));
  
    const live = id_only.filter(video => video.status == "live");
    if (live.length > 0) {
      live.sort((a, b) => (a.start_time > b.start_time ? 1 : -1));
      return yt(live[0].id);
    }
  
    const upcoming = id_only.filter(video => video.status == "upcoming");
    if (upcoming.length > 0) {
      upcoming.sort((a, b) => (a.scheduled_time > b.scheduled_time ? 1 : -1));
      return yt(upcoming[0].id);
    }
  
    return new Response("Nothing scheduled currently");
  }
  
  addEventListener("fetch", event => {
    return event.respondWith(handleRequest());
  });
  