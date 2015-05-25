var Application = {
    initApplication: function () {
        $(document)
            .on('pageinit', '#addfeed-page', function() {
                Application.initAddFeedPage();
            })
            .on('pageinit', '#settings-page', function() {
                Application.initSettingsPage();
            })
            .on('pageinit', '#feedslist-page', function() {
                Application.initListFeedPage();
            })
            .on('pageinit', '#showfeed-page', function() {
                var url = this.getAttribute('data-url').replace(/(.*?)url=/g, '');
                Application.initShowFeedPage(url);
            });
        Application.openLinksInApp();
    },

    initAddFeedPage: function () {
        $('#addfeed-form').submit(function (event) {
            event.preventDefault();
            var feedName = $('#feedname').val().trim();
            var feedUrl = $('#feedurl').val().trim();
            if (feedName === '' || feedName === ' ') {
                navigator.notification.alert('Name cannot be empty!', function () {
                }, 'Error');
                return false;
            }
            if (feedUrl === '' || feedUrl === ' ') {
                navigator.notification.alert('URL cannot be empty!', function () {
                }, 'Error');
                return false;
            }

            if (Feed.searchByName(feedName) === false && Feed.searchByUrl(feedUrl) === false) {
                var feed = new Feed(feedName, feedUrl);
                feed.add();
                navigator.notification.alert('Feed saved.', function () {
                    $.mobile.changePage('index.html');
                }, 'Success');
            }
            else {
                navigator.notification.alert('Error in saving feed. It can exist.', function () {
                }, 'Error');
            }
            return false;
        });
    },

    initListFeedPage: function () {
        var $feedsList = $('#feedslist');
        var items = Feed.getFeeds();
        var htmlItems = '';

        $feedsList.empty();
        items = items.sort(Feed.compare);

        for (var i = 0; i < items.length; i++) {
            htmlItems += '<li><a href="showfeed.html?url=' + items[i].url + '">' + items[i].name + '</a></li>';
        }

        $feedsList.append(htmlItems).listview('refresh');
    },

    initShowFeedPage: function (url) {
        var step = 10;
        var loadFeed = function () {
            var currentEntries = $('#feedentrieslist').find('div[data-role=collapsible]').length;
            var entriesToShow = currentEntries + step;

            $.ajax({
                url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=' + entriesToShow + '&q=' + encodeURI(url),
                dataType: 'json',
                beforeSend: function () {
                    $.mobile.loading('show', {
                        text: 'Please wait...',
                        textVisible: true
                    });
                },
                success: function (data) {
                    var $list = $('#feedentries');
                    if (data.responseData === null) {
                        navigator.notification.alert('Invalid URL!', function () {
                        }, 'Error');
                        return;
                    }

                    var items = data.responseData.feed.entries;

                    var $post;
                    if (currentEntries === items.length) {
                        navigator.notification.alert('End of feeds', function () {
                        }, 'Info');
                        return;
                    }
                    for (var i = currentEntries; i < items.length; i++) {
                        $post = $('<div data-role="collapsible" data-expanded-icon="arrow-d" data-collapsed-icon="arrow-r" data-iconpos="right">');
                        $post
                           .append($('<h2>').text(items[i].title))
                           .append($('<h3>').html('<a href="' + items[i].link + '" target="_blank">' + items[i].title + '</a>')) // Add title
                           .append($('<p>').html(items[i].contentSnippet)) // Add description
                           .append($('<p>').text('Author: ' + items[i].author))
                           .append(
                              $('<a href="' + items[i].link + '" target="_blank" data-role="button">')
                                 .text('Go to the link')
                                 .button()
                                 .click(function (event) {
                                     if (Application.checkRequirements() === false) {
                                         event.preventDefault();
                                         navigator.notification.alert('Data connection is offline.', function () {
                                         }, 'Error');
                                         return false;
                                     }
                                     $(this).removeClass('ui-btn-active');
                                 })
                           );
                        $list.append($post);
                    }
                    $list.collapsibleset('refresh');
                },

                error: function () {
                    navigator.notification.alert('Unable to retrieve data.', function () {
                    }, 'Error');
                },
                complete: function () {
                    $.mobile.loading('hide');
                }
            });
        };

        $('#morefeeds').click(function () {
            loadFeed();
            $(this).removeClass('ui-btn-active');
        });

        $('#deletefeed').click(function () {
            Feed.searchByUrl(url).delete();
            navigator.notification.alert('Feed deleted!', function () {
                $.mobile.changePage('listfeeds.html');
            }, 'Success');
        });
        if (Application.checkRequirements() === true) {
            loadFeed();
        } else {
            navigator.notification.alert('Data connection is offline.', function () {
            }, 'Warning');
        }
    },

    initSettingsPage: function () {
        
    },

    checkRequirements: function () {
        if (navigator.connection.type === Connection.NONE) {
            return false;
        }
        else {
            return true;
        }
    },

    updateIcons: function () {
        var $buttons = $('a[data-icon], button[data-icon]');
        var isMobileWidth = ($(window).width() <= 480);
        isMobileWidth ? $buttons.attr('data-iconpos', 'notext') : $buttons.removeAttr('data-iconpos');
    },

    openLinksInApp: function () {
        $(document).on('click', 'a[target=_blank]', function (event) {
            event.preventDefault();
            window.open($(this).attr('href'), '_blank');
        });
    }
};