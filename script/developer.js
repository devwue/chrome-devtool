/**
 * Created by daijong.kim on 8/22/16.
 */
$(document).ready(function() {
    var sDeveloper = ''
        ,aBackend  = [
             { name: 'Dev',     user: 'staging', thumb: '../images/user.png' }
        ]
        ,Master = 'test.com'
        ,aTmp = []
        ,oResult = $('#users')
        ,oEnv    = $('#environment')
        // reload tab
        ,reload = function() {
            var tabs = chrome.tabs || { query: function() {} };
            tabs.query({
                'active': true
                , currentWindow: true
            }, function (tab) {
                tabs.reload(tab[0].id);
            });
        }
        ,tabs = chrome.tabs || { query: function() {} }
        ;
    tabs.query({
       'active' : true
        ,'currentWindow': true
    }, function(tab){
        var last = tab[0]
            ,cookies = chrome.cookies
            , loc   = new URL(last.url)
            , proto = loc.protocol
            , sUrl  = loc.href
            , domain= sUrl.match('[a-z\d-]+(.com|.net|.kr|.co.kr)')
            ;
        cookies.get({ name: 'developer', url: sUrl }, function(res) {
            var data = res || {}
                ,sDeveloper = data.value || ''
                ,nBackend = aBackend.length
            ;
            gg.each(aBackend, function(item, idx) {
                var sUserId = item.user || ''
                    ,sName  = item.name || ''
                    ,sThumb = item.thumb || ''
                    ,sCss   = sUserId == sDeveloper ? 'active' : ''
                    ,sCssLast = (idx+1 === nBackend) ? 'last' : ''
                    ,sHtml = gg.sprintf('<li class="%s %s"><a data="%s" desc="%s" style="cursor:pointer;"><dl><dt>%s</dt><dt><img src="%s" alt="%s" ></dt></dl></a></li>'
                                , sCss, sCssLast
                                , sUserId, sName
                                , sName, sThumb, sName)
                    ;
                aTmp.push(sHtml);
            });
            oResult.empty().html(aTmp.join(''));
        });
    });


    oEnv.on('click', 'input[name=envType]', function() {
        var self = $(this), val = self.val();
        chrome.runtime.sendMessage({ type: 'setEnv', data: val }, function(res) {
            //console.log(chrome.runtime.lastError);
            chrome.tabs.getSelected(null, function(tab) {
                var Url = new URL(tab.url)
                    ,sUrl= Url.href
                    ,sQuery = Url.pathname
                    ,sProto = Url.protocol
                    ,regex = Url.host.match('[a-z\d-]+(.co.kr|.com|.kr)$')
                    ,isBdt = regex && -1<regex[0].indexOf(Master)
                    ,sMoveUrl
                    ;
                if(isBdt)
                {
                    switch(val)
                    {
                        case 'dev':
                            sMoveUrl = sUrl.replace(/^(https?:\/\/)([\w]+)(-[\w]+)?./,"$1$2-dev.");
                            break;
                        case 'internal':
                            sMoveUrl = sUrl.replace(/^(https?:\/\/)([\w]+)(-[\w]+)?./,"$1$2-staging.");
                            break;
                        case 'production':
                            sMoveUrl = sUrl.replace(/^(https?:\/\/)([\w]+)(-[\w]+)?./,"$1$2.");
                            break;
                    }
                    chrome.tabs.executeScript(tab.id, {code: gg.sprintf('window.location.href="%s";', sMoveUrl)});
                }

            });
        });

    });
    oResult.on('click', 'a', function() {
        var self = $(this)
            , sUser = self.attr('data') || ''
            , sName = self.attr('desc')
            , sKey  = 'developer'
            ;
            if( 'staging' == sUser )
            {
                chrome.tabs.query({
                    'active': true
                    , 'lastFocusedWindow': true
                }, function (tabs) {
                    var tab     = tabs[0].url
                        , loc   = new URL(tab)
                        , proto = loc.protocol
                        , sUrl  = loc.href
                        , isSecure = /https/.test(loc.href)
                        , myUrl  = loc.protocol
                        , oCookie = {
                            "name": sKey
                            , "url": loc.protocol+'//'+Master+'/'
                        }
                        ;
                    console.log('remove',oCookie);
                    chrome.cookies.remove(oCookie, function (cookie) {
                        //console.log(cookie);
                        setActive(self, sUser, reload);
                    });
                });
            }
            else
            {
                chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
                    var url = tabs[0].url
                        ,loc = new URL(url)
                        ,proto = loc.protocol
                        ,sUrl  = loc.href
                        , domain= sUrl.match('[a-z\d-]+(.com|.net|.kr|.co.kr)')
                        , oCookie= {
                            "name": sKey
                            , "value": sUser
                            , "url": sUrl
                            , "expirationDate": (new Date().getTime()) + 86400
                            , "domain" : domain[0]
                            , "path" : '/'
                            , "secure": /(https)/.test(sUrl)
                        }
                        ;
                    console.log('set',oCookie, loc);
                    chrome.cookies.set(oCookie, function (cookie) {
                        console.log(JSON.stringify(cookie));
                        console.log(chrome.extension.lastError);
                        console.log(chrome.runtime.lastError);
                        setActive(self, sUser, reload);
                    });
                });
            }
    });

    chrome.storage.sync.get('lastEnv', function(res) {
        var lastEnv = res['lastEnv'];
        if( lastEnv )
        {
            $('input[name=envType][value='+lastEnv+']').prop('checked', true);
        }
    });

    function setActive(oSel, sUser,fb) {
        var callback = fb || function() {};
        oSel.parent().parent().find('li').each(function(){
            var sub = $(this);

            if( sub.hasClass('active') )
            {
                sub.removeClass('active');
            }
            else if(sUser == sub.children().attr('data') )
                sub.addClass('active');
        });
        callback();
    }
});
