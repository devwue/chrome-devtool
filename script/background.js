var settings = {
		enabled : false
		,icon : ''
		,mode : 'dev' // dev, qa, inter, live
		,lastIdx: 0
		,last: []
		,lastEnv : 'dev'
	}
	,filter = { urls: ["<all_urls>"]}
	,filterAct = ['blocking', 'requestHeaders']
	,oDomains= [
		// dev, qa
		 { domain : 'www.test.com'   	,ip: 'xx.xx.xx.xx', port: 80, env:'dev' }
		// new-staging
		,{ domain : 'www.test.com'   	,ip: 'xx.xx.xx.xx', env:'internal' }
	]
	,default_mode = 'DIRECT'
	,loadEnv  = function() {
		return settings.env;
	}
	,runProxy = function(env) {
		settings.lastEnv= /(dev|qa)/.test(env) ? 'dev' : env;
		var results = oDomains.filter(function(m){
				if(/(dev|qa)/.test(env))
					return -1<m.env.indexOf(settings.lastEnv);
				else
					return -1< m.env.indexOf(settings.lastEnv);
			})
			,proxy = chrome.proxy || { settings: { set: function() {} } }
			,nCnt = results.length
			,script=''
			,mode
			;
		if( 0<nCnt )
		{
			for(var i =0;i<nCnt;i++){
				var info=results[i];
				var ip = info.ip;
				var port = info.port || 80

				if(info.domain.indexOf('*')!=-1)
				{
					script += '}\nelse if(shExpMatch(host,"' + info.domain + '"))\n{';
				}
				else if(-1<info.domain.indexOf('http'))
				{
					script += '}else if(shExpMatch(url,"' + info.domain + '/*")){';
				}
				else{
					script += '}else if(host == "' + info.domain + '"){';
				}

				if( info.ip.indexOf(':') > -1 ){
					var ip_port = info.ip.split(':');
					ip = ip_port[ip_port.length - 2];
					port = ip_port[ip_port.length - 1];
				}
				script += 'return "PROXY ' + ip + ':'+ port +'; DIRECT";';

				script+="\n";
			}
			var data='function FindProxyForURL(url,host){ \n if(shExpMatch(url,"http:*") || shExpMatch(url,"https:*")) \n{if(isPlainHostName(host)){return "DIRECT";' +
					script + '}else{return "'+ default_mode +'";}}else{return "SYSTEM";}}'
				;
			mode = {
				mode: 'pac_script'
				,pacScript: { data: data }
			}
		}
		else {
			mode = {
				mode: 'direct'
			}
		}
	console.log(mode);

		proxy.settings.set({
			value: mode
			,
			scope: 'regular'
		}, function(){
			//console.log('set pac scripts result:',arguments);
		});

	}
	;
chrome.storage.sync.get(settings, function(result) {
	if(result.domain)
		settings.domain = result.domain;
	if(result.ip)
		settings.ip = result.ip;
	if(result.enabled)
		settings.enabled = result.enabled;
	//chrome.browserAction.setIcon({path: (settings.enabled ? 'enabled' : 'disabled') + '.png'});
});

chrome.webRequest.onBeforeSendHeaders.addListener(function(details)
	{
		var  headers = details.requestHeaders
			,customUA= 'Mozilla/5.0 (Linux; U; Android 4.0.3; en-us; ASUS Transformer Pad TF300T Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30'
			,blockingResponse = {}
			,Url = new URL(details.url)
			,sUrl= Url.href
			,sQuery = Url.pathname
			,sProto = Url.protocol
			,isUrlRedirect = settings.enabled && -1<details.url.indexOf('')
			,retHeader = {}
			;
		/* host redirect and host set
		if( settings.enabled ) {
			for(var i=0; i<settings.domains.length; i++)
			{
				console.log('header', Url, settings.domains[i]);
				if( -1<Url.host.indexOf(settings.ipAddr[settings.mode]) )
				{
					details.requestHeaders.push({ name: "Host", value: settings.domains[i] });
					console.log('header', details, setting.last);
					return {requestHeaders: details.requestHeaders};
				}
			}
		}
		*/
		/*
		if( 0 < details.url.indexOf(".mp4") )
		{
			for( var i = 0, l = headers.length; i < l; ++i )
			{
				if( headers[i].name == 'User-Agent' )
				{
					headers[i].value = customUA;
					//break;
				}
			}

			blockingResponse.requestHeaders = headers;
			return blockingResponse;
		}*/
	}
	, filter, filterAct);
chrome.webRequest.onBeforeRequest.addListener( function(details) {
		var Url = new URL(details.url)
			,sUrl= Url.href
			,sQuery = Url.pathname
			,sProto = Url.protocol
			,regex = Url.host.match('[a-z\d-]+(.co.kr|.com|.kr)$')
			;
	/*
		if( regex && -1<regex[0].indexOf('bdtong') && 0 == sUrl.indexOf('https') )
		{
			var redirect = { redirectUrl: details.url.replace('https://', 'http://') };
			console.log('redirect', details, redirect);
			return redirect;
		}
		/* url redirect
		if( settings.enabled ) {
			for(var i=0; i<settings.domains.length; i++)
			{
				if( -1<Url.host.indexOf(settings.domains[i]) )
				{
					settings.lastIdx++;
					settings.last.push({ idx: settings.lastIdx++, host: Url.host });
					var redirect = { redirectUrl: details.url.replace(settings.domains[i], settings.ipAddr[settings.mode]) };
					var redirect = { redirectUrl: details.url.replace(settings.domains[i], settings.ipAddr[settings.mode]) };
					console.log('redirect', details, redirect);
					return redirect;
				}
			}
		}
		*/
	}
	, {
		urls: filter.urls
		, types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
	}
	// Block intercepted requests until this handler has finished
	, ["blocking"]
);
chrome.tabs.onUpdated.addListener(function(id, info, tab){
	chrome.pageAction.show(tab.id);
	// chrome.tabs.executeScript(null, {"file": "script/auth.js"});
});
// message delegate
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	var act = message.type
		,data = message.data
	;
	//console.log('onMessage', message, sender);
	switch(act)
	{
		case 'init':
			getStorage({ key: 'lastEnv'} , function(res) {
				console.log(res);
			});
			break;
		case 'setEnv':
			saveStorage({ 'lastEnv': data }, function(res){
				//runProxy(data);
				sendResponse(res);
			});
			break;
	}
});
function saveStorage(data,fb) {
	chrome.storage.sync.set(data, fb);
}
function getStorage(data, fb) {
	chrome.storage.sync.get(data.key, fb);
}

/*
// Update the declarative rules on install or upgrade.
chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                // When a page contains a <video> tag...
                new chrome.declarativeContent.PageStateMatcher({
                    css: ["video"]
					,pageUrl: { urlContains: '.js' }
                })
            ],
            // ... show the page action.
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
}); */

/*

*/
chrome.storage.onChanged.addListener(function(changes, namespace) {
	//chrome.extension.updateUi(changes, namespace);
	for (key in changes) {
		var storageChange = changes[key];
		console.log('Storage key "%s" in namespace "%s" changed. ' +
			'Old value was "%s", new value is "%s".',
			key,
			namespace,
			storageChange.oldValue,
			storageChange.newValue);
	}
});
