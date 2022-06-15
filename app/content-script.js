const country_name_container = 'ytdc-channel-country-name-container'
const insert_position = 'ytd-video-owner-renderer > #upload-info > ytd-channel-name > ytd-badge-supported-renderer'
const country_regex = 'country":{"simpleText":"(.*?)"},"'

const isVideoUrl = () => new URL(location.href).pathname === '/watch'
const makeChannelAboutUrl = (channelId) => "https://www.youtube.com/channel/" + channelId + "/about"

var isUpdateRunning = false
var isLocationRendered = false
var loadedLocation = ""

const getChanneAboutlLink = async () => {

  //console.log('getChanneAboutlLink');
  const res = await fetch(location.href)
  const text = await res.text()
  const doc = new DOMParser().parseFromString(text, 'text/html');

  channel = doc.querySelector('body > #watch7-content > meta[itemprop="channelId"]')

  if (!channel)
  {
    return null
  }

  channelId = channel.getAttribute("content")
  href = makeChannelAboutUrl(channelId)
  //console.log(href)
  return href
}

const getLocation = async () => {

  //console.log('getLocation at start: ' + loadedLocation)

  if (!loadedLocation){
    const ref =  await getChanneAboutlLink()
    const res = await fetch(ref)
    text = await res.text()
  
    result = text.match(country_regex)
  
    if (!result || result.length != 2)
    {
      return null
    }
  
    loadedLocation = result[1]
    //console.log("getLocation: " + loadedLocation)
  }

  return loadedLocation
}

const delay = millis => new Promise((resolve, reject) => {
  setTimeout(_ => resolve(), millis)
});

const getInsertPosition = async () => {
  return await document.querySelector(insert_position)
}

const checkInsertPositionReady = async () => {

  //console.log('checkInsertPositionReady');
  info = await getInsertPosition()
  wait_cnt = 30

  while (!info && wait_cnt > 0) {
    //console.log("checkInsertPositionReady: wait page loading " + wait_cnt)
    await delay(1000);
    info = await getInsertPosition()
    wait_cnt--
  }
  return info
}

const renderLocationLable = async () => {

  //console.log('renderLocationLable');
  const location = await getLocation()

  if (!location) {
    //console.log("renderLocationLable: no location");
    return
  }

  insertPosition = await checkInsertPositionReady();// await getDocPosition()

  if (!insertPosition) {
    //console.log("renderLocationLable: page not loaded - exit");
    return
  }

  const container = document.createElement('div')
  container.classList.add(
    country_name_container,
    'badge',
    'badge-style-type-live-now',
    'style-scope',
    'ytd-badge-supported-renderer'
  )

  container.textContent = location
  insertPosition.parentElement?.insertBefore(container, insertPosition.nextSibling) 
  isLocationRendered = true
  return
}

updateLocationInfo = async () => {

  //console.log('updateLocationInfo: enter');

  if (isLocationRendered || isUpdateRunning)
  {
    //console.log('updateLocationInfo: LocationRendered or UpdateRunning');
    return
  }
  isUpdateRunning = true

  document
  .querySelectorAll(`.${country_name_container}`)
  .forEach((e) => e.remove())

  if (isVideoUrl()) {
    await renderLocationLable()
  }

  isUpdateRunning = false
  //console.log('updateLocationInfo: exit');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.msg) {
    sendResponse({msg: "ok"})
    //console.log(request.msg);

    if (request.msg == "onUpdated") {
      isLocationRendered = false
      loadedLocation = ""
    }
    updateLocationInfo();
  }
});

window.addEventListener ("load", function(event) {
    //console.log('load');
    updateLocationInfo();
});
