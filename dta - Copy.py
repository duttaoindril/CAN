import os, sys
data= ''


def decode(slf )











while len([f for f in os.listdir("unprocessed") if os.path.isfile(os.path.join("unprocessed", f))])>0:
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
		separated  = [i for i in data]
		#print separated
		os.remove("unprocessed/"+onlyfiles[l])