window.onload = function() {
    //$(document).ready(function(){
    $('.description_col2').each(function() {
        if (this.firstChild != null && $.trim(this.firstChild.nodeValue) == '') {

            $(this).find('br').replaceWith('<span>;</span>');
            var html = '';
            var terms = this.innerText.split(';');
            //console.log(terms);
            terms.forEach(function(term, index) {
                var link = '';
                if (term.includes('<')) {
                    link = term.substring(term.indexOf('<') + 1);
                    link = link.substring(0, link.length - 1)
                    term = term.substring(0, term.indexOf('<') - 1);
                }

                if (term.startsWith('http://') || term.startsWith('https://')) {
                    html = html + '<a class="body_link_11" href="' + term + '">' + term + '</a>';
                } else {
                    html = html + '<a class="body_link_11" href="/cdm/search/searchterm/' + term + '">' + term + '</a>';
                }

                if (link != '') {
                    if (link.includes('viaf.org')) {
                        html = html + '<a title="VIAF Record" href=' + link + '>';
                        html = html + '<span class="icon_11 ui-icon-extlink"></span>';
                        html = html + '</a>';
                    } else if (link.includes('wikipedia.org')) {
                        html = html + '<a title="Wikipedia" href=' + link + '>';
                        html = html + '<span class="icon_11 ui-icon-extlink"></span>';
                        html = html + '</a>';
                    } else if (link.includes('theatricalia.com')) {
                        html = html + '<a title="Theatricalia" href=' + link + '>';
                        html = html + '<span class="icon_11 ui-icon-extlink"></span>';
                        html = html + '</a>';
                    } else if (link.includes('http://id.loc.gov')) {
                        html = html + '<a title="Library of Congress Vocabularies" href=' + link + '>';
                        html = html + '<span class="icon_11 ui-icon-extlink"></span>';
                        html = html + '</a>';
                    } else if (link.includes('getty.edu')) {
                        html = html + '<a title="Getty Vocabularies" href=' + link + '>';
                        html = html + '<span class="icon_11 ui-icon-extlink"></span>';
                        html = html + '</a>';
                    } else {
                        html = html + '<a href=' + link + '>';
                        html = html + '<span class="icon_11 ui-icon-extlink"></span>';
                        html = html + '</a>';
                    }
                }
                html = html + '<br/>';
            });

            this.innerHTML = html;
        }
    });

    cutString = function(words, charcount) {
        var tempwords = '';
        //console.log(words+':'+charcount);
        i = 0;
        while (i < words.length && (i < charcount || (i >= charcount && words[i] != ' '))) {
            tempwords = tempwords + words[i];
            i++;
        }
        //console.log(tempwords);
        return tempwords;
    };

    getObjectWithAttr = function(object, attr) {
        for (i = 0; i < object.length; i++) {
            if (object[i][attr] !== undefined) {
                return object[i];
            }
        }
        return undefined; 
    };

    locale = 'en';
    charCount = 250;

    //gedbpedia content from wikipedia url
    getDbPediaContent = function(wikiUrl, callback, errorcallback) {
        if (wikiUrl === undefined) {
            var result = {
                error: true,
                msg: 'wikipedia url is not defined'
            };

            (errorcallback ? errorcallback(result) : (callback ? callback(result) : false));

            return;
        }

        if (wikiUrl.search('wikipedia.org') < 0) {
            var result = {
                error: true,
                msg: 'not a wikipedia url'
            };
            (errorcallback ? errorcallback(result) : (callback ? callback(result) : false));

            return;
        }

        var apiUrl = 'http://imagesearch-test1.library.illinois.edu/DBPediaProxy/home/entity?url=' + wikiUrl;

        //console.log(apiUrl);

        $.get(apiUrl, function(data) {
            var jsonData = JSON.parse(data);
            //parse wiki url content to get title
            var splitUrl = wikiUrl.split('/');
            //console.log(JSON.stringify(splitUrl));
            var title = splitUrl[splitUrl.length - 1];
            //console.log(title);
            var dbpediaUrl = 'http://dbpedia.org/resource/' + title;
            //getabstratct from json
            var abstracts = jsonData[dbpediaUrl]['http://www.w3.org/2000/01/rdf-schema#comment'];
            var myAbstract = "";
            //getname
            var myNames = jsonData[dbpediaUrl]['http://www.w3.org/2000/01/rdf-schema#label'];
            var myName = "";

            if (myNames !== undefined) {
                myName = searchLiteral(myNames, locale);
            }

            if (abstracts !== undefined) {
                myAbstract = searchLiteral(abstracts, locale);

                //console.log(myAbstract);
                //shortAbstract = cutString(myAbstract, charCount) + ' <a href="' + wikiUrl + '" class="newwindow">[more from Wikipedia]</a>';
                shortAbstract = cutString(myAbstract, charCount);
            }
            var result = {
                title: myName,
                longAbstract: myAbstract,
                shortAbstract: shortAbstract,
                dbpediaUrl: dbpediaUrl,
                resource: jsonData[dbpediaUrl],
                wikiUrl: wikiUrl
            };

            //console.log(result);
            (callback ? callback(result) : true);
        });
    };

    renderLinks = function(links, label) {
        var content = '';
        if (Array.isArray(links)) {
            for (i = 0; i < links.length; i++) {
                var link = links[i];
                content = content + '<br/><a href="' +
                    link + '" class="newwindow">' + label;
                if (links.length > 1) {
                    content = content + '-' + (i + 1) + '</a>'
                } else {
                    content = content + '</a>'
                }
            }
        } else {
            content = content + '<br/><a href="' +
                links + '" class="newwindow">' + label + '</a>';
        }
        return content;
    }

    //Wrap window to deliver nice box
    wrapWindow = function(params, callback1, callback2) {
        /*
        "resource": {
                "premiere": [{ dbpedia: 'http://dbpedia.org/property/premiere', type: 'one' }],
                "playSubject": [{ dbpedia: 'http://dbpedia.org/ontology/subjectOfPlay', type: 'one' }],
                "longAbstract": [{ dbpedia: 'http://www.w3.org/2000/01/rdf-schema#comment', type: 'two', locale: 'en' }],
                "s:name": ["Trelawny of the Wells"],
                "s:type": "Person",
                "s:jobTitle": "actor",
                "birthDate": "1855",
                "deathDate": "1934",
                "gender": "female",
                "address": "blah, blah",
                "openningYear": "1962",
                "homePage": "http://...",
                "seathingCapacity": "500",
                "enWikiUrl": "http://en.wikipedia...",
                "viafUrl": "http://viaf.org/...",
                "worldCatIdUrl": "http://...",
                "theatricaliaUrl": "http://...",
                "bnfUrl": "http://",
                "dnbUrl": "http://...",
                "ImdbUrl": "http://...",
                "ibdbUrl": "http://...",
                "s:sameAs": ["http://..."]
            }
        */
        //console.log('calling callback '+params.id);
        //console.log(params);
        var headerClass = "\"accordion_header ui-accordion-header ui-helper-reset accordion_header_open ui-state-active ui-corner-top ui-state-focus\"";
        var contentClass = "\"accordion_window ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content-active\"";
        var title = '<div id="' + params.id + '" style="margin-bottom: 10px"><h2 class=' +
            headerClass +
            '>' + params['s:name'];
        if (params['s:jobTitle']) {
            title = title + ' (' + params['s:jobTitle'] + ')';
        }
        title = title + '</h2>';

        var ulist = '<ul style="padding-left: 10px;">';
        if (params.address) {
            ulist = ulist + '<li>Address: ' + params.address + '</li>';
        }
        if (params.seatingCapacity) {
            ulist = ulist + '<li>Seating Capacity: ' + params.seatingCapacity.value + '</li>';
        }
        if (params.openingYear) {
            ulist = ulist + '<li>Opening Year: ' + params.openingYear.value + '</li>';
        }
        if (params.homePage) {
            ulist = ulist + '<li><a href="' + params.homePage.value + '" class="newwindow">Homepage</a></li>';
        }
        if (params.gender) {
            if (params.gender !== "unknown") {
                //content = content + 'Gender: ' + gender + '<br/>';
                ulist = ulist + '<li>Gender: ' + params.gender + '</li>';
            }
        }
        if (params.birthdate) {
            //content = content + 'Birth Date: ' + birthdate + '<br/>';
            ulist = ulist + '<li>Birth Date: ' + params.birthdate + '</li>';
        }
        if (params.deathdate) {
            //content = content + 'Death Date: ' + deathdate + '<br/>';
            ulist = ulist + '<li>Death Date: ' + params.deathdate + '</li>';
        }
        if (params.premiere) {
            ulist = ulist + '<li>Premiere: ' + params.premiere.value + '</li>';
        }
        if (params.playSubject) {
            ulist = ulist + '<li>Subject of Play: ' + params.playSubject.value + '</li>';
        }
        ulist = ulist + '</ul>';

        var content = '<div class=' +
            contentClass +
            '><p>' + ulist;
        if (params.shortAbstract) {
            content = content + params.shortAbstract;
            //add wikipedia url
            content = content + ' <a href="' + params.enWikiUrl + '" class="newwindow">[more from Wikipedia]</a>';
        }
        var moreLinks = '';
        if (params.dbpediaUrl) {
            moreLinks = moreLinks + renderLinks(params.dbpediaUrls, "DBPedia");
        }

        if (params.VIAFLink) {
            moreLinks = moreLinks + renderLinks(params.VIAFLink, "VIAF Record");
        }
        if (params.BNFLinks) {
            moreLinks = moreLinks + renderLinks(params.BNFLinks, 'BNF Record');
        }
        if (params.DNBLinks) {
            moreLinks = moreLinks + renderLinks(params.DNBLinks, 'DNB Record');
        }
        if (params.worldCatIdUrl) {
            moreLinks = moreLinks + renderLinks(params.worldCatIdUrl, 'WorldCat Identities');
        }
        if (params.theatricaliaUrl) {
            moreLinks = moreLinks + renderLinks(params.theatricaliaUrl, 'Theatricalia');
        }
        if (params.imdbUrl) {
            moreLinks = moreLinks + renderLinks(params.imdbUrl, 'IMDB');
        }
        if (params.ibdbUrl) {
            moreLinks = moreLinks + renderLinks(params.ibdbUrl, 'IBDB');
        }
        if (params['s:sameAs']) {
            moreLinks = moreLinks + renderLinks(params['s:sameAs'], 'Other');
        }


        var absDialog = title + content + moreLinks;

        absDialog = absDialog + '</p></div></div>';

        //console.log(absDialog);

        (callback1 ? callback1(absDialog) : false);

        var id = params.id;

        $("#" + id + " .newwindow").click(function() {
            url = $(this).attr('href');
            window.open(url, '_blank');
            return false;
        });

        $('#' + id + ' h2').css('background-color', '#578cb5');
        $('#' + id + ' h2').css('background-image', 'none');
        $('#' + id + ' h2,#' + id + ' div').css('border-color', '#578cb5');
        $('#' + id + ' h2').css('color', 'white');
        $('#' + id + ' a').addClass('body_link_11');
        (callback2 ? callback2(absDialog) : false);
        $('#verticalDragbarImg').css('visibility', 'hidden');
    }

    getViafContent = function(viafUrl, callback, errorcallback) {
        //call dbpedia link using jquery ajax request
        if (viafUrl === undefined) {
            var result = {
                error: true,
                msg: 'viafurl is not defined'
            };
            (errorcallback ? errorcallback(result) : (callback ? callback(result) : false));

            return;
        }

        if (viafUrl.search('viaf.org') < 0) {
            var result = {
                error: true,
                msg: 'not a viafurl'
            };
            (errorcallback ? errorcallback(result) : (callback ? callback(result) : false));

            return;
        }
        //call dbpedia link using jquery ajax request                   

        var apiUrl = 'http://imagesearch-test1.library.illinois.edu/VIAFProxy/api/name?url=' + viafUrl + '&type=json';
        $.get(apiUrl, function(data) {
            var jsonData = data;
            // getWiki content
            var wikis = jsonData['Wikipedia'];
            var wikiUrl = '';
            for (i = 0; i < wikis.length; i++) {
                if (wikis[i].search('en.wikipedia') >= 0) {
                    wikiUrl = wikis[i];
                    //break immediate
                    break;
                }
            }
            var result = { wikiUrl: wikiUrl, viafData: data };
            if (wikiUrl !== '') {
                result.found = true;
                getDbPediaContent(wikiUrl, function(dbPediaRes) {
                    result.dbpediaData = dbPediaRes;
                    (callback ? callback(result) : false);
                });
            }
        });
    };

    searchLiteral = function(literals, locale) {
        if (literals !== undefined) {
            for (i = 0; i < literals.length; i++) {
                if (literals[i]['lang'] === locale) {
                    return literals[i]['value'];
                }
            };
        }
        return undefined;
    };

    //AutomapperConfig class
    AutomapperConfig = function() {
        //this.enWikiUrl = [];
        this.VIAFLink = [];
        this.BNFLinks = [];
        this.DNBLinks = [];
        this.worldCatIdUrl = [];
        this.theatricaliaUrl = [];
        this.imdbUrl = [];
        this.ibdbUrl = [];
        this["s:sameAs"] = [];
    }

    //Niko start coding for left side menu 
    $(document).ready(function() {
        //$('#image_title,#title_desc_bar').wrap('<div id="wrapper" style="overflow: auto"></div>');
        $('#image_title, #title_desc_bar, #tabs, #details').wrapAll('<div id="wrapper2" style="overflow: auto"></div>');
        $('#wrapper2').wrap('<div id="wrapper" style="overflow: auto"></div>');
        $('#wrapper').prepend('<div id="sidebar" style="width:25%; float:left;margin: 10px 5px;"></div>');
        $('#sidebar').prepend('<div id="side-title" style="margin: 0px 0px 30px"></div>');
        $('#sidebar').append('<div id="side-spacer" style="margin: 0px 5px 5px"></div>');
        $('#sidebar').append('<div id="side-play" style="margin: 0px 5px 10px"></div>');
        $('#sidebar').append('<div id="side-author" style="margin: 0px 5px 10px"></div>');
        $('#sidebar').append('<div id="side-coauthor" style="margin: 0px 5px 10px"></div>');
        $('#sidebar').append('<div id="side-theater" style="margin: 0px 5px 10px"></div>');
        //$('#side-title').html($('#image_title').html());
        $('#side-title').html('<h1 class="cdm_style">External Resources</h1>');
        //$('#verticalDragbarImg').hide();
        var locale = 'en';
        data = JSON.parse($("#rdf").html());
        //console.log(JSON.stringify(data));

        /*
        automapperConfig = {
            "resource": {
                "premiere": [{ dbpedia: 'http://dbpedia.org/property/premiere', type: 'one' }],
                "playSubject": [{ dbpedia: 'http://dbpedia.org/ontology/subjectOfPlay', type: 'one' }],
                "longAbstract": [{ dbpedia: 'http://www.w3.org/2000/01/rdf-schema#comment', type: 'two', locale: 'en' }],
                "s:name": ["Trelawny of the Wells"],
                "s:type": "Person",
                "s:jobTitle": "actor",
                "birthDate": "1855",
                "deathDate": "1934",
                "gender": "female",
                "address": "blah, blah",
                "openningYear": "1962",
                "homePage": "http://...",
                "seathingCapacity": "500",
                "enWikiUrl": "http://en.wikipedia...",
                "VIAFLink": ["http://viaf.org/..."],
                "worldCatIdUrl": ["http://..."],
                "theatricaliaUrl": ["http://..."],
                "BNFLinks": ["http://"],
                "DNBLinks": ["http://..."],
                "imdbUrl": ["http://..."],
                "ibdbUrl": ["http://..."],
                "s:sameAs": ["http://..."]
            }
        */

        //get theather              
        //wiki url
        //wikiUrl = data['isPartOf'][1]['s:locationCreated']['@id'];
        var wikiUrls = getObjectWithAttr(data['isPartOf'], 's:locationCreated');
        if (wikiUrls !== undefined) {
            wikiUrls = wikiUrls['s:locationCreated'];
            var theaters = [];
            //fetch array or object into theaters
            if (Array.isArray(wikiUrls)) {
                for (var i = 0; i < wikiUrls.length; i++) {
                    theaters.push(wikiUrls[i]['@id']);
                };
            } else {
                theaters.push(wikiUrls['@id']);
            }

            //Render array into array of resources
            //resources = [];
            for (var i = 0; i < theaters.length; i++) {
                var theater = theaters[i];
                getDbPediaContent(theater, function(result) {
                    if (!result.error) {
                        var resource = new AutomapperConfig();
                        resource.address = searchLiteral(result.resource['http://dbpedia.org/ontology/address'], locale);
                        resource.seatingCapacity = (result.resource['http://dbpedia.org/ontology/seatingCapacity'] ? result.resource['http://dbpedia.org/ontology/seatingCapacity'][0] : undefined);
                        resource.openingYear = (result.resource['http://dbpedia.org/ontology/openingYear'] ? result.resource['http://dbpedia.org/ontology/openingYear'][0] : undefined);
                        resource.homePage = (result.resource['http://xmlns.com/foaf/0.1/homepage'] ? result.resource['http://xmlns.com/foaf/0.1/homepage'][0] : undefined);
                        resource.longAbstract = result.longAbstract;
                        resource.shortAbstract = result.shortAbstract;
                        resource['s:name'] = result.title;
                        resource.enWikiUrl = theater;
                        resource.dbpediaUrl = result.dbpediaUrl;
                        resource.id = 'theater-' + i;
                        wrapWindow(resource, function(absDialog) {
                            $('#side-theater').append(absDialog);
                        });
                        //resources.push(resource);
                    }
                });
            }

        }

        fetchContributor = function(contributorArr, type, callback) {
            for (var j = 0; j < contributorArr.length; j++) {
                var resource = new AutomapperConfig();
                resource.viafUrl = contributorArr[j]['@id'];
                if (type === 'author') {
                    resource['s:jobTitle'] = 'Author';
                } else {
                    resource['s:jobTitle'] = contributorArr[j]['s:jobTitle'];
                }
                resource['s:name'] = contributorArr[j]['s:name'];
                var otherContribUrls = contributorArr[j]['s:sameAs'];
                var winId = type + '-' + j;
                resource.id = type + '-' + j;

                //call dbpedia link using jquery ajax request   
                //console.log(j)                        
                getViafContent(resource.viafUrl, function(result) {
                    if (!result.error) {
                        //console.log(JSON.stringify(result));
                        if (resource['s:name'] === undefined) {
                            resource['s:name'] = result.dbpediaData.title;
                        };

                        resource.gender = result.viafData['Gender'];
                        resource.birthDate = result.viafData['BirthDate'];
                        resource.deathDate = result.viafData['DeathDate'];
                        resource.longAbstract = result.dbpediaData.longAbstract;
                        resource.shortAbstract = result.dbpediaData.shortAbstract;
                        resource.enWikiUrl = result.wikiUrl;
                        resource.dbpediaUrl = result.dbpediaData.dbpediaUrl;
                        links = ['VIAFLink', 'DNBLinks', 'BNFLinks'];
                        links2 = ['VIAF Record', 'DNB Record', 'BNF Record'];

                        for (var i = 0; i < links.length; i++) {
                            render = result.viafData[links[i]];
                            if (render) {
                                if (Array.isArray(render)) {
                                    for (k = 0; k < render.length; k++) {
                                        if (render[k] !== undefined) {
                                            resource[links[i]].push(render[k]);
                                        }
                                    }
                                } else {
                                    if (result.viafData[links[i]] !== undefined) {
                                        resource[links[i]].push(result.viafData[links[i]]);
                                    }
                                }
                            }
                        }
                    }

                    if (otherContribUrls !== undefined) {
                        for (var jj = 0; jj < otherContribUrls.length; jj++) {
                            var otherContribUrl = otherContribUrls[jj];
                            if (otherContribUrl.includes('theatricalia.com')) {
                                resource['theatricaliaUrl'].push(otherContribUrl);
                            } else if (otherContribUrl.includes('worldcat.org/identities')) {
                                resource['worldCatIdUrl'].push(otherContribUrl);
                            } else if (otherContribUrl.includes('imdb.com')) {
                                resource['imdbUrl'].push(otherContribUrl);
                            } else {
                                resource['s:sameAs'].push(otherContribUrl);
                            }
                        }
                    }
                    console.log(resource);
                    (callback ? callback(resource) : false);
                });
            }
        };

        //get coauthor              
        //viafUrl = data['isPartOf'][1]['s:exampleOfWork']['s:author'][0]['@id'];
        var contributorsObj = getObjectWithAttr(data['isPartOf'], 'contributor');
        if (contributorsObj !== undefined) {
            var contributors = contributorsObj['contributor'];
            var contributorArr = [];
            if (Array.isArray(contributors)) {
                for (var i = 0; i < contributors.length; i++) {
                    contributorArr.push(contributors[i]);
                };
            } else {
                contributorArr.push(contributors);
            }

            fetchContributor(contributorArr, 'coauthor', function(resource) {
                wrapWindow(resource, function(absDialog) {
                    $('#side-coauthor').append(absDialog);
                });
            })
        }

        //get author                
        //author url
        //viafUrl = data['isPartOf'][1]['s:exampleOfWork']['s:author'][0]['@id'];
        var viafUrls = getObjectWithAttr(data['isPartOf'], 's:exampleOfWork');
        if (viafUrls !== undefined) {
            //viafUrls = viafUrl['s:exampleOfWork']['s:author'][0]['@id'];
            viafUrls = viafUrls['s:exampleOfWork']['s:author'];
            var authorArr = [];
            if (Array.isArray(viafUrls)) {
                for (j = 0; j < viafUrls.length; j++) {
                    authorArr.push(viafUrls[j]);
                }
            } else {
                authorArr.push(viafUrls);
            }

            fetchContributor(authorArr, 'author', function(resource) {
                wrapWindow(resource, function(absDialog) {
                    $('#side-author').append(absDialog);
                });
            })
        }

        //playUrl = data['isPartOf'][1]['s:sameAs'];
        var playUrl = getObjectWithAttr(data['isPartOf'], ['s:exampleOfWork']);
        if (playUrl !== undefined) {
            playUrl = playUrl['s:sameAs'];
            var playArr = [];
            if (Array.isArray(playUrl)) {
                for (j = 0; j < playUrl.length; j++) {
                    playArr.push(playUrl[j]);
                }
            } else {
                playArr.push(playUrl);
            }

            //Render array into array of resources
            for (var i = 0; i < playArr.length; i++) {
                var play = playArr[i];
                getDbPediaContent(play, function(result) {
                    if (!result.error) {
                        var resource = new AutomapperConfig();
                        resource.premiere = (result.resource['http://dbpedia.org/property/premiere'] ? result.resource['http://dbpedia.org/property/premiere'][0] : false);
                        resource.playSubject = (result.resource['http://dbpedia.org/ontology/subjectOfPlay'] ? result.resource['http://dbpedia.org/ontology/subjectOfPlay'][0] : false);
                        resource.homePage = (result.resource['http://xmlns.com/foaf/0.1/homepage'] ? result.resource['http://xmlns.com/foaf/0.1/homepage'][0] : undefined);
                        resource.longAbstract = result.longAbstract;
                        resource.shortAbstract = result.shortAbstract;
                        resource['s:name'] = result.title;
                        resource.enWikiUrl = play;
                        resource.dbpediaUrl = result.dbpediaUrl;
                        resource.id = 'play-' + i;
                        wrapWindow(resource, function(absDialog) {
                            $('#side-play').append(absDialog);
                        });
                        //resources.push(resource);                        
                    }
                });
            }
        }

        turnOnNewWindow = function(id) {
            $("#" + id + " a").click(function() {
                url = $(this).attr('href');
                window.open(url, '_blank');
                return false;
            });
        };

        turnOnNewWindow('metadata_play');
        turnOnNewWindow('metadata_theatr');
        turnOnNewWindow('metadata_creato');
        turnOnNewWindow('metadata_assocg');

        $('#wrapper2').css('min-width', '250px');
        $('#wrapper2').css('width', '70%');
        $('#wrapper2').css('float', 'left');
    });
}
