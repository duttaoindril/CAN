import os, sys
import json
from pprint import pprint

data= ''
jsondict= ''

def a(toAscii):
	return toAscii.encode('ascii','ignore')

with open('candictionary.json') as data_file: 
    jsondict = json.load(data_file)
    # print type(a(jsondict["185"]["signals"][0]["name"]))
    # print a(jsondict["185"]["signals"][0]["name"])

# while len([f for f in os.listdir("unprocessed") if os.path.isfile(os.path.join("unprocessed", f))])>0:
onlyfiles = [f for f in os.listdir("unprocessed") if os.path.isfile(os.path.join("unprocessed", f))]
print onlyfiles
for l in range(0,len(onlyfiles)):

	file = open("unprocessed/"+onlyfiles[l], "rb")
	while 1:
	 	try:
			data+= '{0:08b}'.format(ord(file.read(1)))
	 	except:
	 		file.close()
	 		break
	print data
	print bool(data[0:8])
	print bool(data[8:16])
	print int(data[16:])
	# separated  = [i for i in data]
	# for n in range(0,len(separated)):
	# 	new_data=''
	# 	new_data= int(separated[n])
	# print new_data[0]

		# os.remove("unprocessed/"+onlyfiles[l])