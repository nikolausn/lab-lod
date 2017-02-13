window.onload = function() {
    //$(document).ready(function(){
    $('.description_col2').each(function() {
        if (this.firstChild != null && $.trim(this.firstChild.nodeValue) == '') {
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
                html = html + '<a class="body_link_11" href="/cdm/search/searchterm/' + term + '">' + term + '</a>';

                if (link != '') {
                    html = html + '<a href=' + link + '>';
                    html = html + '<span class="icon_11 ui-icon-extlink"></span>';
                    html = html + '</a>';
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

    locale = 'en';
    charCount = 250;

    //gedbpedia content from wikipedia url
    getDbPediaContent = function(wikiUrl, callback, errorcallback) {
        if (wikiUrl === undefined) {
            (errorcallback?errorcallback({ msg: 'wikipedia url is not defined' }):false);
            return;
        }

        if (wikiUrl.search('wikipedia.org') < 0) {
            (errorcallback?errorcallback({ msg: 'not a wikipedia' }):false);
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
            /*
            for (i=0;i<myNames.length;i++){
            	if(myNames[i]['lang']===locale){
            		myName = myNames[i]['value'];
            		//break immediate
            		break;
            	}
            }
            */
            myName = searchLiteral(myNames, locale);

            /*
            for (i=0;i<abstracts.length;i++){
            	if(abstracts[i]['lang']===locale){
            		myAbstract = abstracts[i]['value'];
            		//break immediate
            		break;
            	}
            }
            */
            myAbstract = searchLiteral(abstracts, locale);

            //console.log(myAbstract);

            shortAbstract = cutString(myAbstract, charCount);
            var result = {
                title: myName,
                longAbstract: myAbstract,
                shortAbstract: shortAbstract + '...',
                dbpediaUrl: dbpediaUrl,
                resource: jsonData[dbpediaUrl]
            };

            //console.log(result);

            (callback ? callback(result) : true);
        });
    };

    //Wrap window to deliver nice box
    wrapWindow = function(params, callback1, callback2) {
        /*
        params: {
        	id: window id
        	title: window title
        	content:
        }
        */
        //console.log('calling callback '+params.id);
        headerClass = "\"accordion_header ui-accordion-header ui-helper-reset accordion_header_open ui-state-active ui-corner-top ui-state-focus\"";
        contentClass = "\"accordion_window ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content-active\"";
        absDialog = '<div id="' + params.id + '" style="margin-bottom: 10px"><h2 class=' +
            headerClass +
            '>' + params.title + '</h2><div class=' +
            contentClass +
            '><p>' +
            params.content + '</p></div></div>';
        (callback1 ? callback1(absDialog) : false);
        //$('#sidebar').prepend(absDialog);
        //$('#theater').accordion();
        //$('#theater').accordion('refresh');					
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
    }

    getViafContent = function(viafUrl, callback, errorcallback) {
        //call dbpedia link using jquery ajax request
		if (viafUrl===undefined) {
            (errorcallback?errorcallback({ msg: 'viafurl is not defined' }):false);
            return;
        }

        if (viafUrl.search('viaf.org') < 0) {
            (errorcallback?errorcallback({ msg: 'not a viafurl' }):false);
            return;
        }

        apiUrl = 'http://imagesearch-test1.library.illinois.edu/VIAFProxy/api/name?url=' + viafUrl + '&type=json';
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

    //Niko start coding for left side menu
    $(document).ready(function() {
        $('#top_content').wrap('<div id="wrapper" style="overflow: auto"></div>');
        $('#wrapper').prepend('<div id="sidebar" style="width:26%; float:left;margin: 72px 10px;"></div>');
        $('#sidebar').prepend('<div id="side-title" style="margin: 0px 5px 10px"></div>');
        //$('#side-title').html($('#image_title').html());
        $('#side-title').html('<h1 class="cdm_style">Linked Data</h1>');
        var locale = 'en';
        data = JSON.parse($("#rdf").html());
        //console.log(JSON.stringify(data));

        //get theather 				
        //wiki url
        wikiUrl = data['isPartOf'][1]['s:locationCreated']['@id'];
        //console.log(wikiUrl);		
        getDbPediaContent(wikiUrl, function(result) {
            //console.log(result);
            //console.log(JSON.stringify(result.resource));
            var content = '';
            address = searchLiteral(result.resource['http://dbpedia.org/ontology/address'], locale);
            if (address) {
                content = content + 'Address: ' + address + '<br/>';
            }
            seating = (result.resource['http://dbpedia.org/ontology/seatingCapacity'] ? result.resource['http://dbpedia.org/ontology/seatingCapacity'][0] : false);
            if (seating) {
                content = content + 'Seating Capacity: ' + seating.value + '<br/>';
            }
            opening = (result.resource['http://dbpedia.org/ontology/openingYear'] ? result.resource['http://dbpedia.org/ontology/openingYear'][0] : false);
            if (opening) {
                content = content + 'Opening Year: ' + opening.value + '<br/>';
            }
            content = content + '<br/>' + result.shortAbstract + '<br/><a href="' + result.dbpediaUrl + '" class="newwindow">DBPedia</a>';

            homepage = (result.resource['http://xmlns.com/foaf/0.1/homepage'] ? result.resource['http://xmlns.com/foaf/0.1/homepage'][0] : false);
            if (homepage) {
                content = content + '<br/><a href="' + homepage.value + '" class="newwindow">Homepage</a>';
            }

            wrapWindow({
                id: 'theater',
                title: result.title,
                content: content
            }, function(absDialog) {
                $('#side-title').after(absDialog);
                author(play(function() {
                    $('#verticalDragbarImg').css('left', '60%');
                    //$('#sidebar').prepend($('#image_title').clone());			
                }));
            });
        });

        author = function(callback) {
            //get author 				
            //author url
            viafUrl = data['isPartOf'][1]['s:exampleOfWork']['s:author'][0]['@id'];
            //console.log(wikiUrl);		
            //call dbpedia link using jquery ajax request					

            getViafContent(viafUrl, function(result) {
                //console.log(JSON.stringify(result));
                gender = result.viafData['Gender'];
                var content = '';
                if (gender !== "unknown") {
                    content = content + 'Gender: ' + gender + '<br/>';
                }
                birthdate = result.viafData['BirthDate'];
                if (birthdate) {
                    content = content + 'Birth Date: ' + birthdate + '<br/>';
                }
                deathdate = result.viafData['DeathDate'];
                if (deathdate) {
                    content = content + 'Death Date: ' + deathdate + '<br/>';
                }
                content = content + '<br/>' + result.dbpediaData.shortAbstract;
                links = ['DNBLinks', 'VIAFLink', 'BNFLinks'];
                for (i = 0; i < links.length; i++) {
                    render = result.viafData[links[i]];
                    if (render) {
                        if (typeof(render) === 'object' && render.length > 1) {
                            for (j = 0; j < render.length; j++) {
                                content = content + '<br/><a href="' +
                                    result.viafData[links[i]][j] + '" class="newwindow">' + links[i] + '-' + (j + 1) + '</a>'
                            }
                        } else if (typeof(render) === 'object') {
                            content = content + '<br/><a href="' +
                                result.viafData[links[i]][0] + '" class="newwindow">' + links[i] + '</a>'
                        } else {
                            content = content + '<br/><a href="' +
                                result.viafData[links[i]] + '" class="newwindow">' + links[i] + '</a>'
                        }
                    }
                }
                content = content + '<br/><a href="' +
                    result.dbpediaData.dbpediaUrl + '" class="newwindow">DBPedia</a>'

                wrapWindow({
                    id: 'author',
                    title: result.dbpediaData.title,
                    content: content
                }, function(absDialog) {
                    $('#side-title').after(absDialog);
                    (callback ? callback() : false);
                });
            });
        }

        play = function(callback) {
            //get Play
            playUrl = data['isPartOf'][1]['s:sameAs'];
            if (playUrl !== undefined) {
                getDbPediaContent(playUrl, function(result) {
                    //			console.log(JSON.stringify(result));
                    var content = '';
                    premiere = (result.resource['http://dbpedia.org/property/premiere'] ? result.resource['http://dbpedia.org/property/premiere'][0] : false);
                    if (premiere) {
                        content = content + 'Premiere: ' + premiere.value + '<br/>';
                    }
                    subjectOfPlay = (result.resource['http://dbpedia.org/ontology/subjectOfPlay'] ? result.resource['http://dbpedia.org/ontology/subjectOfPlay'][0] : false);
                    if (subjectOfPlay) {
                        content = content + 'Subject of Play: ' + subjectOfPlay.value + '<br/>';
                    }
                    content = content + '<br/>' + result.shortAbstract + '<br/><a href="' + result.dbpediaUrl + '" class="newwindow">DBPedia</a>';
                    $('#metadata_play .body_link_11').append('<a href="' + playUrl + '" title="Wikipedia"><span class="icon_11 ui-icon-extlink"></span></a>');
                    wrapWindow({
                        id: 'play',
                        title: result.title,
                        content: content
                    }, function(absDialog) {
                        $('#side-title').after(absDialog);
                        (callback ? callback() : false);
                    });
                });
            }
        }

        /*
        apiUrl = 'http://imagesearch-test1.library.illinois.edu/DBPediaProxy/home/entity?url='+wikiUrl;
        $.get(apiUrl,function(data){
        	var jsonData = JSON.parse(data);
        	//parse wiki url content to get title
        	var splitUrl = wikiUrl.split('/');
        	//console.log(JSON.stringify(splitUrl));
        	var title = splitUrl[splitUrl.length-1];
        	//console.log(title);
        	dbpediaUrl = 'http://dbpedia.org/resource/'+title;
        	//getabstratct from json
        	var abstracts = jsonData[dbpediaUrl]['http://www.w3.org/2000/01/rdf-schema#comment'];
        	var myAbstract = "";
        	//getname
        	var myNames = jsonData[dbpediaUrl]['http://dbpedia.org/property/name'];
        	var myName = "";
        	for (i=0;i<myNames.length;i++){
        		if(myNames[i]['lang']===locale){
        			myName = myNames[i]['value'];
        			//break immediate
        			break;
        		}
        	}

        	for (i=0;i<abstracts.length;i++){
        		if(abstracts[i]['lang']===locale){
        			myAbstract = abstracts[i]['value'];
        			//break immediate
        			break;
        		}
        	}
        	
        	
        	headerClass = "\"accordion_header ui-accordion-header ui-helper-reset accordion_header_open ui-state-active ui-corner-top ui-state-focus\"";
        	contentClass = "\"accordion_window ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content-active\"";
        	absDialog = '<div id="theater" style="margin-bottom: 10px"><h2 class='+
        	headerClass+
        	'>'+myName+'</h2><div class='+
        	contentClass+
        	'><p>'+
        	myAbstract+'<br/><a href="'+dbpediaUrl+'" class="newwindow">DBPedia</a></p></div></div>';
        	$('#sidebar').prepend(absDialog);
        	//$('#theater').accordion();
        	//$('#theater').accordion('refresh');
        				
        	
        	//$(".newwindow").click(function(){
        	//	url = $(this).attr('href');
        	//	window.open(url,'_blank');
        	//	return false;
        	//});
        	$('#theater h2').css('background-color', '#578cb5');
        	$('#theater h2').css('background-image', 'none');
        	$('#theater h2,#theater div').css('border-color', '#578cb5');
        	$('#theater h2').css('color', 'white');
        	
        	attr(style)
        });
        */
        /*
        	console.log('calling callback theater');
        	headerClass = "\"accordion_header ui-accordion-header ui-helper-reset accordion_header_open ui-state-active ui-corner-top ui-state-focus\"";
        	contentClass = "\"accordion_window ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content-active\"";
        	absDialog = '<div id="theater" style="margin-bottom: 10px"><h2 class='+
        	headerClass+
        	'>'+result.title+'</h2><div class='+
        	contentClass+
        	'><p>'+
        	result.shortAbstract+'<br/><a href="'+result.dbpediaUrl+'" class="newwindow">DBPedia</a></p></div></div>';
        	$('#sidebar').prepend(absDialog);
        	//$('#theater').accordion();
        	//$('#theater').accordion('refresh');
        				
        	
        	//$(".newwindow").click(function(){
        	//	url = $(this).attr('href');
        	//	window.open(url,'_blank');
        	//	return false;
        	//});
        	$('#theater h2').css('background-color', '#578cb5');
        	$('#theater h2').css('background-image', 'none');
        	$('#theater h2,#theater div').css('border-color', '#578cb5');
        	$('#theater h2').css('color', 'white');		
        	*/

        /*
        apiUrl =  'http://imagesearch-test1.library.illinois.edu/VIAFProxy/api/name?url='+viafUrl+'&type=json';
        $.get(apiUrl,function(data){
        	var jsonData = data;
        	// getWiki content
        	var wikis = jsonData['Wikipedia'];
        	console.log(jsonData);
        	var wikiUrl = '';			
        	for(i=0;i<wikis.length;i++){
        		if(wikis[i].search('en.wikipedia')>=0){
        			wikiUrl = wikis[i];
        			//break immediate
        			break;
        		}
        	}
        							
        	var dbpediaApiUrl = 'http://imagesearch-test1.library.illinois.edu/DBPediaProxy/home/entity?url='+wikiUrl;		
        	$.get(dbpediaApiUrl,function(data){
        		var jsonData = JSON.parse(data);
        		//parse wiki url content to get title
        		var splitUrl = wikiUrl.split('/');
        		//console.log(JSON.stringify(splitUrl));
        		var title = splitUrl[splitUrl.length-1];
        		//console.log(title);
        		var dbpediaUrl = 'http://dbpedia.org/resource/'+title;
        		//getabstratct from json
        		var abstracts = jsonData[dbpediaUrl]['http://www.w3.org/2000/01/rdf-schema#comment'];
        		var myAbstract = "";
        		//getname
        		var myNames = jsonData[dbpediaUrl]['http://dbpedia.org/property/name'];
        		var myName = "";
        		for (i=0;i<myNames.length;i++){
        			if(myNames[i]['lang']===locale){
        				myName = myNames[i]['value'];
        				//break immediate
        				break;
        			}
        		}				

        		for (i=0;i<abstracts.length;i++){
        			if(abstracts[i]['lang']===locale){
        				myAbstract = abstracts[i]['value'];
        				//break immediate
        				break;
        			}
        		}				
        		
        		headerClass = "\"accordion_header ui-accordion-header ui-helper-reset accordion_header_open ui-state-active ui-corner-top ui-state-focus\"";
        		contentClass = "\"accordion_window ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content-active\"";
        		absDialog = '<div id="author" style="margin-bottom: 10px"><h2 class='+
        		headerClass+
        		'>'+myName+'</h2><div class='+
        		contentClass+
        		'><p>'+
        		myAbstract+'<br/><a href="'+dbpediaUrl+'" class="newwindow">DBPedia</a><br/><a href="'+
        		viafUrl+'" class="newwindow">VIAF</a>'
        		'</p></div></div>';
        		$('#sidebar').append(absDialog);
        		//$('#theater').accordion();
        		//$('#theater').accordion('refresh');
        		
        		$(".newwindow").click(function(){
        			url = $(this).attr('href');
        			window.open(url,'_blank');
        			return false;
        		});
        		
        		$('#verticalDragbarImg').css('left','60%');
        	});	
        });
        */


        $('#top_content').css('min-width', '250px');
        $('#top_content').css('width', '65%');
        $('#top_content').css('float', 'left');

    });
}
