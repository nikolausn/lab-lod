import csv, json, re

class Entity(object):
  def __init__(self, fullname):
    # if there is a link
    if re.search('<(.*)>', fullname):
      name_link = re.match('(.*) (?:<(.*)>)', fullname).groups()
      fullname = name_link[0].strip()
      self.link = name_link[1].strip()
    else:
      self.link = None

    self.name = fullname

class Person(object):
  def __init__(self, fullname):
    # if there is a link
    if re.search('<(.*)>', fullname):
      name_link = re.match('(.*) (?:<(.*)>)', fullname).groups()
      fullname = name_link[0].strip()
      self.link = name_link[1].strip()
    else:
      self.link = None

    if re.search('[0-9]{4}', fullname):
      name_date = re.match('(.*), ([0-9]{4})?\??-?([0-9]{4})?', fullname).groups()
      self.name = name_date[0].strip()
      self.birthdate = name_date[1]
      self.deathdate = name_date[2]
    else:
      self.name = fullname
      self.birthdate = None
      self.deathdate = None

    self.fullname = fullname

def addAssociatedPeople(row, role):
  if row[role].strip() != '':
    names = row[role].split(';')
    
    name_rdfs = []
    for name in names:
      person = Person(name.strip())

      name_rdf = {}
      name_rdf['@type'] = 'Person'

      if person.link != None:
        name_rdf['@id'] = person.link
      else:
        name_rdf['s:name'] = person.name
        if person.birthdate != None:
          name_rdf['s:birthdate'] = person.birthdate
        if person.deathdate != None:
          name_rdf['s:deathdate'] = person.deathdate

      # niko modified this code to add sameAs            
      if person.fullname in peopleDict.keys():
        sameAs = [];
        lods = peopleDict[person.fullname]['lod'];
        for lod in lods:
          sameAs.append(lod['link']);
        if(len(sameAs) > 0):
          name_rdf['s:sameAs'] = sameAs;
        if('role' in peopleDict[person.fullname].keys()):
          name_rdf['s:jobTitle'] = peopleDict[person.fullname]['role'];

      name_rdfs.append(name_rdf)

    return name_rdfs
  else:
    return []
          
# Niko add
# Make Dictionary for people, performance and theater
# parse people for people dictionary
peopleDict = {}
with open('Motley_People_Links_Full.csv', 'r') as peopleFile:
  myReader = csv.reader(peopleFile);
  header = next(myReader);
  #print(header);
  peopleReader = csv.DictReader(peopleFile,header,delimiter=',');
  fetchPerson = '';
  for row in peopleReader:
    person = row['Person'];
    if(person!=''):
      fetchPerson = person;  
    role = row['Role'];
    website = row['Website'];
    link = row['Link']
    if fetchPerson not in peopleDict.keys():
      peopleDict[fetchPerson] = {};
      peopleDict[fetchPerson]['lod'] = [];
    
    if(role!=''):
      peopleDict[fetchPerson]['role'] = role;
    if(website!='' and link!=''):
      peopleDict[fetchPerson]['lod'].append({'source': website,'link': link});

  #print(json.dumps(peopleDict));

performanceDict = {}
with open('Motley_Performance_Links_Full.csv', 'r') as perfFile:
  myReader = csv.reader(perfFile);
  header = next(myReader);
  #print(header);
  perfReader = csv.DictReader(perfFile,header,delimiter=',');
  fetchPerf = '';
  for row in perfReader:
    production = row['Production'];
    if(production!=''):
      fetchPerf = production;
    year = row['Year'];
    location = row['Location'];
    source = row['Source'];
    sourceType = row['Source Type'];
    link = row['Link']
    if fetchPerf not in performanceDict.keys():
      performanceDict[fetchPerf] = {};
      performanceDict[fetchPerf]['lod'] = [];
    
    if(year!=''):
      performanceDict[fetchPerf]['year'] = year;
    if(location!=''):
      performanceDict[fetchPerf]['location'] = location;
    if(source!='' and link!=''):
      performanceDict[fetchPerf]['lod'].append({ 'source': source, 'type': sourceType, 'link': link });

  #print(json.dumps(performanceDict));

theatreDict = {}
with open('Motley_Theatre_Links_Full.csv', 'r') as theaterFile:
  myReader = csv.reader(theaterFile);
  header = next(myReader);
  #print(header);
  theaterReader = csv.DictReader(theaterFile,header,delimiter=',');
  fetchTheater = '';
  for row in theaterReader:
    theater = row['Theatre'];
    if(theater!=''):
      fetchTheater = theater;
    source = row['Source'];
    link = row['Link']
    if fetchTheater not in theatreDict.keys():
      theatreDict[fetchTheater] = {};
      theatreDict[fetchTheater]['lod'] = [];
    
    if(source!='' and link!=''):
      theatreDict[fetchTheater]['lod'].append({ 'source': source, 'link': link });

  #print(json.dumps(theatreDict));

# End of additional dictionary

with open('ContentDM-Motley-Links.csv', 'rU') as csvfile:
  reader = csv.DictReader(csvfile, delimiter = ',')
  record = {}
  stagework = {}
  for row in reader:
    # parse contentDm number from rdf file
    rdfaLink = row['RDFa'].split('/');
    filename = rdfaLink[len(rdfaLink)-1];
    contentDmNumber = filename.split('.')[0];

    refURL2 = row['Reference URL'].replace(':8081/', '/');

    #with open('motley-rdfa-google/' + row['CONTENTdm number'] + '.json', 'w') as output:
    with open('motley-rdfa-google/' + contentDmNumber + '.json', 'w') as output:
      record['@context'] = {'@vocab': 'http://schema.org/', 'scp' : 'http://imagesearch-test1.library.illinois.edu/scp/'}
      # this must be changed to reference url
      record['@id'] = refURL2;
      record['@type'] = 'VisualArtwork'
      record['name'] = row['Image Title'].strip()
      record['isPartOf'] = [{ '@id' : 'http://imagesearch-test1.library.illinois.edu/cdm/landingpage/collection/test-motley/',
                            '@type' : 'CreativeWork', 'additionalType' : 'Collection'}]

      stagework['@context'] = {'s': 'http://schema.org/', 'scp' : 'http://imagesearch-test1.library.illinois.edu/scp/'}
      #stagework['@id'] = 'http://imagesearch-test1.library.illinois.edu/cdm/landingpage/collection/test-motley/'
      stagework['@type'] = 'CreativeWork'
      stagework['additionalType'] = 'StageWork'

      if row['Performance Title'].strip() != '':      
        stagework['s:name'] = row['Performance Title'].strip()
        # niko add sameAs attribute
        performance = stagework['s:name'];
        if performance in performanceDict.keys():
          stagework['s:sameAs'] = [];
          lods = performanceDict[performance]['lod'];
          for lod in lods:
            stagework['s:sameAs'].append(lod['link']);


      if row['Opening Performance Date'].strip() != '':
        stagework['s:dateCreated'] = row['Opening Performance Date'].strip()

      # ad multi theater 
      myTheaters = row['Theater'].split(';');
      myStageworks = [];
      for myTheater in myTheaters: 
        #if row['Theater'].strip() != '':
        if myTheater.strip() != '':
          entity = Entity(myTheater.strip())
          theater = {};

          if entity.link != None:
            #stagework['s:locationCreated'] = { '@id' : entity.link }
            theater = { '@id' : entity.link }
          else:
            #stagework['s:locationCreated'] =  entity.name 
            theater = { 'name': entity.name };

          #print(theater);
          if entity.name in theatreDict.keys():
              sameAs = [];
              lods = theatreDict[entity.name]['lod'];
              #print(lods);
              for lod in lods:
                sameAs.append(lod['link']);
              if(len(sameAs) > 0):
                theater['s:sameAs'] = sameAs;
          # sum it up to stagework
          myStageworks.append(theater);

      stagework['s:locationCreated'] = myStageworks;



      if row['Author'].strip() != '':
        stagework['s:exampleOfWork'] = { '@type' : 'Book', 's:author' : [] }
        names = row['Author'].split(';')
        for name in names:
          person = Person(name.strip())
          author = {}
          if person.link != None:        
            # niko modified this code to make element instead of string only
            # stagework['s:exampleOfWork']['s:author'].append({ '@type' : 'Person', '@id' : person.link })
            author = { '@type' : 'Person', '@id' : person.link };
          else:
            # niko modified this code to make element instead of string only
            # stagework['s:exampleOfWork']['s:author'].append(person.name)
            author = { 'name': person.name }
            # stagework['s:exampleOfWork']['s:author'].append(person.name)

          # niko modified this code to add sameAs            
          if person.fullname in peopleDict.keys():
            sameAs = [];
            lods = peopleDict[person.fullname]['lod'];
            for lod in lods:
              sameAs.append(lod['link']);
            if(len(sameAs) > 0):
              author['s:sameAs'] = sameAs;

          #add into author   
          stagework['s:exampleOfWork']['s:author'].append(author);


      
      contributors = []
      contributors = contributors + addAssociatedPeople(row, 'Associated People (Composer)')
      contributors = contributors + addAssociatedPeople(row, 'Associated People (Composer)')
      contributors = contributors + addAssociatedPeople(row, 'Associated People (Set Designer)')
      contributors = contributors + addAssociatedPeople(row, 'Associated People (Translator)')
      contributors = contributors + addAssociatedPeople(row, 'Associated People (Producer)')
      contributors = contributors + addAssociatedPeople(row, 'Associated People (Conductor)')
      contributors = contributors + addAssociatedPeople(row, 'Associated People (Choregrapher)')
      contributors = contributors + addAssociatedPeople(row, 'Associated People (Director)')
      contributors = contributors + addAssociatedPeople(row, 'Associated People (Editor)')
      contributors = contributors + addAssociatedPeople(row, 'Associated People (Actor)')
      contributors = contributors + addAssociatedPeople(row, 'Associated People (Architect)')

      if len(contributors) > 0:
        stagework['contributor'] = contributors

      if row['Object'].strip() != '':
        record['genre'] = row['Object'].strip()

      if row['Type'].strip() != '':
        record['artform'] = row['Type'].strip()

      if row['Material/Techniques'].strip() != '':
        record['artMedium'] = [mt.strip() for mt in row['Material/Techniques'].split(';')]

      if row['Support'].strip() != '':
        record['artworkSurface'] = row['Support'].strip()

      if row['Dimensions'].strip() != '':
        dimensions = re.match('(.*)x(.*)', row['Dimensions']).groups()
        record['width'] = { '@type': 'Distance', 'name' : dimensions[0].strip() + ' inches' }
        record['height'] = { '@type': 'Distance', 'name' : dimensions[1].strip() + ' inches' }

      record['description'] = []
      if row['Description'].strip() != '':
        record['description'].append(row['Description'].strip())
      if row['Notes'].strip() != '':
        record['description'].append(row['Notes'].strip())

      if row['Production notes'].strip() != '':
        if row['Production notes'].strip().startswith('http'):
          stagework['s:mainEntityOfPage'] = { '@type': 'WebPage', '@id' : row['Production notes'].strip() }
        else:
          stagework['s:description'] = row['Production notes'].strip()

      if row['Inscriptions'].strip() != '':
        record['text'] = row['Inscriptions'].strip()

      record['about'] = []
      if row['Style or Period'].strip() != '':
        record['about'] = record['about'] + [sp.strip() for sp in row['Style or Period'].split(';')]

      record['about'].append({ '@id' : 'http://id.loc.gov/authorities/subjects/sh85134531'})

      if row['Subject I (AAT)'].strip() != '':
        for aat in row['Subject I (AAT)'].split(';'):
          eAAT = Entity(aat);
          if(eAAT.link!=None):
            record['about'].append({'@id': eAAT.link});
          else:
            record['about'].append({'@id': eAAT.name});
        #record['about'] = record['about'] + [aat.strip() for aat in row['Subject I (AAT)'].split(';')]
      if row['Subject II (TGMI)'].strip() != '':
        for tgmi in row['Subject II (TGMI)'].split(';'):
          eTGMI = Entity(tgmi);
          if(eTGMI.link!=None):
            record['about'].append({'@id': eTGMI.link});
          else:
            record['about'].append({'@id': eTGMI.name});

        #record['about'] = record['about'] + [tgmi.strip() for tgmi in row['Subject II (TGMI)'].split(';')]

      if row['JPEG2000 URL'].strip() != '':
        record['associatedMedia'] = row['JPEG2000 URL'].strip()

      if row['Physical Location'].strip() != '':
        record['provider'] = {'@id' : 'http://viaf.org/viaf/129370513'}

      if row['Collection Title'].strip() != '':
        record['copyrightHolder'] = {'@type' : 'Organization', '@id' : 'http://viaf.org/viaf/129370513', 'name': 'University of Illinois at Urbana-Champaign. Rare Book and Manuscript Library'};

      record['isPartOf'].append(stagework)

      output.write(json.dumps(record, indent=2))


      # if row['Inventory Number'].strip() != '':
      #   output.write('<tr>')
      #   output.write('<td class="description_col1">')
      #   output.write('Inventory Number')
      #   output.write('</td>')
      #   output.write('<td class="description_col2">')
      #   #output.write('<span property="scp:standardNumber" content="' + row['Inventory Number'].strip() + '"/>')
      #   output.write('<span>' + row['Inventory Number'].strip() + '</span>')
      #   output.write('</td>')
      #   output.write('</tr>')
