function notifyContentScript(tabId, tabUrl, listener)
{
  if (tabUrl){
    //console.log(listener + " " +  tabId + " " + tabUrl);
    //check if YouTube url
    if (tabUrl.indexOf("https://www.youtube.com/watch") >=0){
      chrome.tabs.sendMessage(tabId, {msg: listener}, (response) => {
        //check the rerror for not to throw uhandled error
        if (!chrome.runtime.lastError) {}
      });
    }
  }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo){
      notifyContentScript(tabId, changeInfo.url, "onUpdated")
})

chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab){
    notifyContentScript(activeInfo.tabId, tab.url, "onActivated")
  }); 
});
