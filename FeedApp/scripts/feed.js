function Feed(name, url) {
    var _db = window.localStorage;
    var _table = 'feeds';

    this.name = name;
    this.url = url;

    this.load = function () {
        return JSON.parse(_db.getItem(_table));
    };

    this.save = function(feeds) {
        _db.setItem(_table, JSON.stringify(feeds));
    };
}

Feed.prototype.add = function() {
    var idx = Feed.getIndex(this);
    var feeds = Feed.getAllFeeds();

    if (idx === false) {
        feeds.push(this);
    } else {
        feeds[idx] = this;
    }
};

Feed.prototype.delete = function() {
    var idx = Feed.getIndex(this);
    var feeds = Feed.getAllFeeds();

    if (idx === true) {
        feeds.splice(idx, 1);
        this.save(feeds);
    }

    return feeds;
};

Feed.prototype.compareTo = function(nfeed) {
    return Feed.compare(this, nfeed);
};

Feed.compare = function(feed, nfeed) {
    if (nfeed === null || nfeed === undefined) {
        return 1;
    }
    if (feed === null || feed === undefined) {
        return -1;
    }
    return (feed.name.localeCompare(nfeed.name) === 0) ? feed.url.localeCompare(nfeed.url) : feed.name.localeCompare(nfeed.name);
};

Feed.getAllFeeds = function() {
    var feeds = new Feed().load();
    return (feeds === null) ? [] : feeds;
};

Feed.getFeed = function(feed) {
    var idx = Feed.getIndex(feed);
    if (idx === false) {
        return null;
    }
    var feed = Feed.getAllFeeds()[idx];
    return new Feed(feed.name, feed.url);
};

Feed.getIndex = function(feed) {
    var feeds = Feed.getAllFeeds();
    for (var i = 0; i < feeds.length; i++) {
        if (feed.compareTo(feeds[i]) === 0) {
            return i;
        }
    }
};

Feed.deleteAllFeeds = function() {
    new Feed().save([]);
};

Feed.searchByName = function (name) {
    var feeds = Feed.getAllFeeds();
    for (var i = 0; i < feeds.length; i++) {
        if (feeds[i].name === name) {
            return new Feed(feeds[i].name, feeds[i].url);
        }
    }
    return false;
};

Feed.searchByUrl = function (url) {
    var feeds = Feed.getAllFeeds();
    for (var i = 0; i < feeds.length; i++) {
        if (feeds[i].url === url) {
            return new Feed(feeds[i].name, feeds[i].url);
        }
    }
    return false;
};