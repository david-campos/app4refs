(function(app) {
    var main = null;
    var mainRow = null;
    var nav = {};
    var pages = {};
    
    window.addEventListener('load', function() {
        main = document.getElementsByTagName('main')[0];
        mainRow = main.childNodes[0];
        nav.backButton = document.getElementById('nav-back-btn');
        nav.titleText = document.getElementById('app-nav-title');
        
        app.navigateToPage = function(page, params) {
            page.renderingCallback(params);
            nav.setTitle(page.title);
            nav.setBack(page.parent);
            nav.setVisible(page.displayNav);
        }
        
        app.drawGridOfIcons = function(cols, icons) {
            var rows = icons.length / cols;
            var colW = 12 / cols;
            var heightPerc = 100.0 / rows;
            
            // Draw all divs at once (it is more efficient)
            var html = '';
            for(var icon in icons) {
                if(icons.hasOwnProperty(icon)) {
                    var callback = icons[icon];
                    html += '<div class="col-' + colW + ' btn" data-icon="'+icon+'" style="height: '+ heightPerc + '%"></div>';
                }
            }
            mainRow.innerHTML = html;
            
            // Set bg-image and callback
            var idx = 0;
            for(var icon in icons) {
                if(icons.hasOwnProperty(icon)) {
                    var callback = icons[icon];
                    var col = mainRow.childNodes[idx];
                    col.style.backgroundImage = 'url(ico/' + col.getAttribute("data-icon") + ')';
                    col.addEventListener('click', callback);
                    idx += 1;
                }
            }
        }
       
        nav.back = null;
        
        nav.setTitle = function(title) {
            nav.titleText.innerHTML = title;
        }
        
        nav.setBack = function(pageKey) {
            nav.back = pageKey;
        }
        
        nav.setVisible = function(visible) {
            document.body.className = (visible?"":"noNav");
        }
        
        var buttons = {
            'mainmenu/infonew.png': function(){alert('info');},
            'mainmenu/helpnew.png': function(){alert('help');},
            'mainmenu/servicesnew2.png': function(){alert('services');},
            'mainmenu/leisurenew.png': function(){alert('leisure');},
            'mainmenu/ser-internet.png': function(){alert('internet');},
            'mainmenu/emergency.png': function(){alert('emergency');}
        };
        var page = new app.GridPage({}, "Main", false, 2, buttons);
        
        app.navigateToPage(page);
    });
})(window.app = window.app || {});