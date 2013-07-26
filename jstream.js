// Flora JStream by LeaskH.com
// Inspired by http://stackoverflow.com/questions/1112413/cross-browser-implementation-of-http-streaming-push-ajax-pattern

var jstream = {

    prvLen : null,

    nxtIdx : null,

    timer  : null,

    http   : null,

    pop    : null,

    dead   : null,

    live   : false,

    init   : function(url, pop, dead) {
        this.prvLen = 0;
        this.nxtIdx = 0;
        this.live   = true;
        this.pop    = pop;
        this.dead   = dead;
        var http = this.http = new XMLHttpRequest();
        http.open('post', url);
        http.onreadystatechange = this.listen;
        http.send();
        this.timer  = setInterval(this.listen, 1000);
    },

    listen : function() {
        var http = jstream.http;
        if ((http.readyState   !== 4 && http.readyState !== 3)
         || (http.readyState   === 3 && http.status     !== 200)
         ||  http.responseText === null) { // In konqueror http.responseText is sometimes null here...
            return;
        }
        if (http.readyState    === 4 && http.status     !== 200) {
            jstream.kill();
        }
        while (jstream.prvLen !== http.responseText.length) {
            if (http.readyState === 4  && jstream.prvLen === http.responseText.length) {
                break;
            }
            jstream.prvLen  = http.responseText.length;
            var rawResp    = http.responseText.substring(jstream.nxtIdx);
            var lneResp    = rawResp.split('\n');
            jstream.nxtIdx += rawResp.lastIndexOf('\n') + 1;
            if (rawResp[rawResp.length - 1] !== '\n' || !lneResp[lneResp.length]) {
                lneResp.pop();
            }
            if (jstream.pop) {
                for (var i = 0; i < lneResp.length; i++) {
                    if (lneResp[i]) {
                        jstream.pop(lneResp[i]);
                    }
                }
            }
        }
        if (http.readyState === 4 && jstream.prvLen === http.responseText.length) {
            jstream.kill();
        }
    },

    kill   : function () {
        clearInterval(this.timer);
        if (this.http) {
            this.http.abort();
        }
        if (this.dead) {
            this.dead();
        }
        this.live = false;
    }

};
