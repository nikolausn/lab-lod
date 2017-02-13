import csv;
import argparse;
import sys;
import re;


#read configuration
#auto config
parser = argparse.ArgumentParser(description='Split Content DM column and aggregate the content');
parser.add_argument('-f','--file',help='Content DM file');
parser.add_argument('-c','--columns',help='Column names to be split and aggregate, separate with comma for multi columns');

#parse argument
args = parser.parse_args(sys.argv[1:]);
#make array from argument
argobj = vars(args);

if(argobj['file'] is not None):
	inputFileName = argobj['file']
else:
	#if auto config doesn't exist use default config
	print("You must define file name");
	exit();

if(argobj['columns'] is not None):
	columns = argobj['columns'].split(",");
else:
	#if auto config doesn't exist use default config
	print('You must define column name');
	exit();


lodFile = open(inputFileName, 'r');

#skip header to get field names
lodReader = csv.reader(lodFile);
lodHeader = next(lodReader);
lodRows = csv.DictReader(lodFile,lodHeader,delimiter=',');

#aggregateWriters = {};
aggregateColumns = {};

for column in columns:
	aggregateColumns[column] = {};
#	aggregateWriter[column] = csv.writer(open(filename, 'w')); 


for row in lodRows:
	for column in columns:
		#get the values
		matcher = re.compile('&lt;.*&gt;');
		values = row[column];

		values = re.sub(r'&lt;.*&gt;','',values);

		values = values.split(";");
		#aggregate the value using 		
		for value in values:
			value = value.strip();

			if value not in aggregateColumns[column].keys():
				aggregateColumns[column][value] = 1;
			else:
				aggregateColumns[column][value] = aggregateColumns[column][value] + 1;

for column in columns:
	csvFile = open(column+'.csv','w');
	writer = csv.writer(csvFile);
	writer.writerow([column,'count']);
	for key,value in aggregateColumns[column].items():
		myRow = [key,value];
		writer.writerow(myRow);
	csvFile.close();
